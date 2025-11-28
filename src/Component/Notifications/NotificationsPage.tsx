// src/pages/NotificationsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsReadAsync,
  removeNotification,
} from "../../features/notificationsSlice";
import type { RootState } from "@/store";

/**
 * NotificationsPage
 * - Loads all notifications from API list endpoint
 * - Unseen items are highlighted (light green) + green dot
 * - Clicking an item marks it as read (optimistic UI) and fires markAsReadAsync
 */

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((s: RootState) => s.notifications.items);
  const unreadCount = useSelector((s: RootState) => s.notifications.unreadCount);

  // Keep a local set of IDs we've optimistically marked read (so UI updates instantly)
  const [optimisticRead, setOptimisticRead] = useState<Set<string>>(new Set());

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

  // Click handler: mark as read (optimistic + async)
  const handleClick = (id: string) => {
    // optimistic: add to local set so UI immediately shows as read (green removed)
    setOptimisticRead((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // fire server-side mark-as-read (slice thunk)
    dispatch(markAsReadAsync({ id }) as any);
  };

  // Remove notification (local)
  const handleRemove = (id: string) => {
    dispatch(removeNotification(id) as any);
    // also remove from optimistic set in case it was there
    setOptimisticRead((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Mark all read (iterate)
  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      // optimistic: add all to set
      setOptimisticRead((prev) => {
        const next = new Set(prev);
        next.add(n.id);
        return next;
      });
      // await each call to avoid flooding
      // eslint-disable-next-line no-await-in-loop
      await dispatch(markAsReadAsync({ id: n.id }) as any);
    }
  };

  const clearAll = () => {
    for (const n of notifications) {
      dispatch(removeNotification(n.id) as any);
    }
    setOptimisticRead(new Set());
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
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
          >
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
          >
            Clear all
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-gray-500">No notifications available.</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => {
            const isRead = Boolean(n.read) || optimisticRead.has(n.id);
            const itemClass = isRead ? "bg-white" : "bg-green-50";
            return (
              <div
                key={n.id}
                className={`${itemClass} p-4 border rounded-lg cursor-pointer hover:shadow-sm transition`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1"
                    // clicking the content marks as read (optimistic)
                    onClick={() => handleClick(n.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-base font-medium">{n.title}</div>
                      {!isRead && (
                        <span className="ml-2 inline-block w-3 h-3 bg-green-600 rounded-full" />
                      )}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{n.body}</div>
                    <div className="text-xs text-gray-400 mt-2">{fmtDate(n.created_at)}</div>
                  </div>

                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <button
                      onClick={() => handleRemove(n.id)}
                      className="text-sm px-2 py-1 border rounded hover:bg-gray-50"
                    >
                      Remove
                    </button>
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

export default NotificationsPage;
