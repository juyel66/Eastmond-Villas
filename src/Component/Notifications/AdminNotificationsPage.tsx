// src/pages/NotificationsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsReadAsync,
  markAsReadLocal,
  markAllAsReadAsync,
  markAllAsReadLocal,
  type Notification,
} from "../../features/notificationsSlice";
import type { RootState } from "@/store";

/**
 * NotificationsPage
 * - Loads all notifications from API list endpoint
 * - Unseen items are highlighted (light green) + green dot
 * - Clicking an item marks it as read (global optimistic) and fires markAsReadAsync
 * - Mark All Read button marks all notifications as read via single API call
 */

const AdminNotificationPage: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (s: RootState) => s.notifications.items
  );
  const unreadCount = useSelector(
    (s: RootState) => s.notifications.unreadCount
  );
  
  const [markingAll, setMarkingAll] = useState(false);

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
      // fire server-side mark-as-read (slice thunk)
      dispatch(markAsReadAsync({ id: notif.id }) as any);
    }
  };

  // Mark all read with single API call
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    
    setMarkingAll(true);
    
    try {
      // Optimistic update - immediately update UI
      dispatch(markAllAsReadLocal());
      
      // API call to mark all as read - POST to /api/notifications/mark-all-as-read/
      await dispatch(markAllAsReadAsync() as any);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // If API fails, refetch to restore correct state
      dispatch(fetchNotifications() as any);
    } finally {
      setMarkingAll(false);
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
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markingAll}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              unreadCount === 0 || markingAll
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            }`}
          >
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          No notifications available.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => {
            const isRead = Boolean(n.read);
            const itemClass = isRead 
              ? "bg-white border-gray-200" 
              : "bg-green-50 border-green-200";

            const name = n.data?.name;
            const email = n.data?.email;
            const phone = n.data?.phone;
            const message = n.data?.message || n.body || "";
            const createdAt = n.data?.created_at || n.created_at;

            return (
              <div
                key={n.id}
                className={`${itemClass} p-4 border rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200`}
                onClick={() => handleClick(n)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="text-base font-semibold text-gray-800">
                        {n.title}
                      </div>
                      {!isRead && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-green-700">NEW</span>
                          <span className="inline-block w-3 h-3 bg-green-600 rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Contact details from data */}
                    {name && (
                      <div className="text-sm text-gray-800 mb-1">
                        <span className="font-medium">Name:</span> {name}
                      </div>
                    )}
                    {email && (
                      <div className="text-sm text-gray-800 mb-1">
                        <span className="font-medium">Email:</span> {email}
                      </div>
                    )}
                    {phone && (
                      <div className="text-sm text-gray-800 mb-1">
                        <span className="font-medium">Phone:</span> {phone}
                      </div>
                    )}

                    {message && (
                      <div className="text-sm text-gray-700 mt-3 p-2 bg-gray-50 rounded">
                        {message}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-3">
                      {fmtDate(createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationPage;