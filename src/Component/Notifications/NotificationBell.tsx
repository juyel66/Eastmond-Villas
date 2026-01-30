// src/components/NotificationBell.tsx
import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/store";
import {
  markAsReadAsync,
  markAsReadLocal,
  type Notification,
} from "../../features/notificationsSlice";

const NotificationBell: React.FC = () => {
  const unread = useSelector(
    (s: RootState) => s.notifications.unreadCount
  );
  const allItems = useSelector(
    (s: RootState) => s.notifications.items
  );
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false); // default: show only unseen
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user role from Redux store
  const userRole = useSelector((s: RootState) => s.auth?.user?.role || '');

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // when opening dropdown, default to unseen-only
  useEffect(() => {
    if (open) setShowAll(false);
  }, [open]);

  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // preview: unseen by default, else all
  const previewItems = (
    showAll
      ? allItems
      : allItems.filter((i) => !i.read)
  ).slice(0, 6);

  const onClickNotif = (notif: Notification) => {
    if (!notif.read) {
      // global optimistic: update store immediately
      dispatch(markAsReadLocal(notif.id));
    }

    // dispatch async thunk to mark read on server
    dispatch(markAsReadAsync({ id: notif.id }) as any);

    // keep behavior: close dropdown and navigate if payload has url
    setOpen(false);

    const url =
      notif.data?.url ?? notif.data?.redirect ?? undefined;
    if (url) navigate(url);
  };

  // Determine notification page URL based on user role
  const getNotificationPageUrl = () => {
    const basePath = "/dashboard";
    
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return `${basePath}/admin/notifications`;
      case 'agent':
        return `${basePath}/agent/notifications`;
      case 'customer':
        return `${basePath}/customer/notifications`;
      case 'user':
        return `${basePath}/user/notifications`;
      default:
        // Default to admin if role is not recognized or empty
        return `${basePath}/notifications`;
    }
  };

  // Get view all URL with filter parameter
  const getViewAllUrl = () => {
    const baseUrl = getNotificationPageUrl();
    return showAll ? baseUrl : `${baseUrl}?filter=unseen`;
  };

  // Get open notifications page URL
  const getOpenNotificationsUrl = () => {
    return getNotificationPageUrl();
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="p-2 rounded hover:bg-gray-100 relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute  right-0  mt-2 lg:w-96 w-60  bg-white border shadow-lg rounded z-50">
          <div className="p-3  border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">Notifications</span>
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-sm text-gray-600 underline"
              >
                {showAll ? "Show unseen only" : "Show all"}
              </button>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                navigate(getViewAllUrl());
              }}
              className="text-sm text-blue-600"
            >
              View all
            </button>
          </div>

          <div className="max-h-72 overflow-auto">
            {previewItems.length === 0 && (
              <div className="p-4 text-sm text-gray-500">
                {showAll
                  ? "No notifications."
                  : "No unseen notifications."}
              </div>
            )}

            {previewItems.map((n) => (
              <div
                key={n.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-start ${
                  !n.read ? "bg-gray-50" : "bg-white"
                }`}
                onClick={() => onClickNotif(n)}
              >
                <div className="flex-1 pr-3">
                  <div className="text-sm font-medium">
                    {n.title}
                  </div>

                  {/* Show message if present */}
                  <div className="text-xs text-gray-700 truncate">
                    {n.data?.message || n.body}
                  </div>

                  <div className="text-[11px] text-gray-400 mt-1">
                    {fmtDate(n.created_at)}
                  </div>
                </div>

                {!n.read && (
                  <div className="ml-2 mt-1">
                    <span className="w-2 h-2 block rounded-full bg-red-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-2 border-t text-center">
            <button
              onClick={() => {
                setOpen(false);
                navigate(getOpenNotificationsUrl());
              }}
              className="text-sm text-blue-600"
            >
              Open notifications page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;