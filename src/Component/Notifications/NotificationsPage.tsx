// src/pages/NotificationsPage.tsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsReadAsync,
  markAsReadLocal,
  type Notification,
} from "../../features/notificationsSlice";
import type { RootState } from "@/store";

/**
 * NotificationsPage
 * - Loads all notifications from API list endpoint
 * - Unseen items are highlighted (light green) + green dot
 * - Clicking an item marks it as read (global optimistic) and fires markAsReadAsync
 */

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (s: RootState) => s.notifications.items
  );
  const unreadCount = useSelector(
    (s: RootState) => s.notifications.unreadCount
  );

  // Fetch notifications
  useEffect(() => {
    dispatch(fetchNotifications() as any);
  }, [dispatch]);

  // Helper: format ISO -> friendly
  const fmtDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // Click handler: mark as read (global optimistic + async)
  const handleClick = (notif: Notification) => {
    if (!notif.read) {
      // optimistic: update Redux item + unreadCount immediately
      dispatch(markAsReadLocal(notif.id));
    }
    // fire server-side mark-as-read (slice thunk)
    dispatch(markAsReadAsync({ id: notif.id }) as any);
  };

  // Mark all read (iterate)
  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      // global optimistic
      dispatch(markAsReadLocal(n.id));
      // await each call to avoid flooding
      // eslint-disable-next-line no-await-in-loop
      await dispatch(markAsReadAsync({ id: n.id }) as any);
    }
  };

  // List sorted newest first (if not already)
  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        const aa = a.created_at ?? "";
        const bb = b.created_at ?? "";
        return bb.localeCompare(aa);
      }),
    [notifications]
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount} unread
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
          >
            Mark all read
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-gray-500">
          No notifications available.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => {
            const isRead = Boolean(n.read);
            const itemClass = isRead ? "bg-white" : "bg-green-50";

            const name = n.data?.name;
            const email = n.data?.email;
            const phone = n.data?.phone;
            const message =
              n.data?.message || n.body || "";
            const createdAt =
              n.data?.created_at || n.created_at;
              

            return (
              <div
                key={n.id}
                className={`${itemClass} p-4 border rounded-lg cursor-pointer hover:shadow-sm transition`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1"
                    // clicking the content marks as read (global optimistic)
                    onClick={() => handleClick(n)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-base font-medium">
                        {n.title}
                      </div>
                      {!isRead && (
                        <span className="ml-2 inline-block w-3 h-3 bg-green-600 rounded-full" />
                        
                      )}
                    </div>

                    {/* Contact details from data */}
                    {name && (
                      <div className="text-sm text-gray-800 mt-1">
                        <span className="font-semibold">
                          Name:
                        </span>{" "}
                        {name}
                      </div>
                    )}
                    {email && (
                      <div className="text-sm text-gray-800">
                        <span className="font-semibold">
                          Email:
                        </span>{" "}
                        {email}
                      </div>
                    )}
                    {phone && (
                      <div className="text-sm text-gray-800">
                        <span className="font-semibold">
                          Phone:
                        </span>{" "}
                        {phone}
                      </div>
                    )}

                    {message && (
                      <div className="text-sm text-gray-700 mt-2">
                        {message}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      {fmtDate(createdAt)}
                    </div>
                  </div>

                

                  {/* Delete / Clear removed so nothing is "fake-deleted" */}
                
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
