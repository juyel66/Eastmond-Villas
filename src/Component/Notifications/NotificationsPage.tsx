// src/pages/NotificationsPage.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  markAsRead,
  markAllRead,
  removeNotification,
  clearNotifications,
} from "../../features/notificationsSlice";
import type { RootState } from "@/store";

export const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((s: RootState) => s.notifications.items);

  if (!notifications) return null;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dispatch(markAllRead())}
            className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Mark all notifications as read"
          >
            Mark all read
          </button>
          <button
            onClick={() => dispatch(clearNotifications())}
            className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Clear all notifications"
          >
            Clear all
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <article
              key={n.id}
              className={`w-full border rounded-lg p-4 shadow-sm transition ${
                !n.read ? "bg-gray-50" : "bg-white"
              }`}
              role="listitem"
              aria-live={!n.read ? "polite" : "off"}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Content area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {n.title}
                      </h3>
                      <p
                        className="text-sm text-gray-700 mt-1 break-words"
                        style={{ wordBreak: "break-word" }}
                      >
                        {/* allow longer messages but prevent overflow */}
                        {n.body}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-2 text-xs text-gray-400">
                    {n.created_at}
                  </div>
                </div>

                {/* Action area */}
                <div className="flex-shrink-0">
                  <div className="flex items-center sm:flex-col gap-2">
                    {!n.read ? (
                      <button
                        className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onClick={() => dispatch(markAsRead(n.id))}
                        aria-label={`Mark notification ${n.id} as read`}
                      >
                        Mark read
                      </button>
                    ) : (
                      <button
                        className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={() => dispatch(removeNotification(n.id))}
                        aria-label={`Remove notification ${n.id}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
