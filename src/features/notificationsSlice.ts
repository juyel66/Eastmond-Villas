// src/store/notificationsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/* -----------------------------------
   Notification Shape
----------------------------------- */
export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  read: boolean;
  created_at?: string;
}

/* -----------------------------------
   State
----------------------------------- */
interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

/* -----------------------------------
   Helpers
----------------------------------- */

/**
 * Decide whether an id looks like a "real" server id.
 * - Accepts: numeric strings ("1725"), UUIDs (hex-4-4-4-4-12), or typical server ids.
 * - Rejects: synthetic ids like "summary-12345", "notif-<ts>-<rand>"
 */
const isServerId = (id: string) => {
  if (!id) return false;
  // numeric id
  if (/^\d+$/.test(id)) return true;
  // UUID v4-ish
  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      id
    )
  )
    return true;
  // other server-style patterns you may want to accept — add here if needed
  return false;
};

/* -----------------------------------
   Fetch All Notifications
----------------------------------- */

interface FetchNotificationsResult {
  items: Notification[];
  unseenCount?: number;
}

export const fetchNotifications = createAsyncThunk<
  FetchNotificationsResult,
  void,
  { rejectValue: { message: string } }
>("notifications/fetchNotifications", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("auth_access") || "";

    const res = await fetch(
      "https://api.eastmondvillas.com/api/notifications/list/",
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return rejectWithValue({
        message: text || "Failed to fetch notifications",
      });
    }

    const data = await res.json();

    let rawNotifications: any[] = [];
    let unseenCountFromApi: number | undefined;

    if (Array.isArray(data)) {
      // Old style: plain array
      rawNotifications = data;
    } else if (data && typeof data === "object") {
      // New style (your sample)
      // {
      //   count,
      //   next,
      //   previous,
      //   results: {
      //     unseen_count,
      //     notifications: [...]
      //   }
      // }
      if (data.results && typeof data.results === "object") {
        if (Array.isArray(data.results.notifications)) {
          rawNotifications = data.results.notifications;
        }
        if (typeof data.results.unseen_count === "number") {
          unseenCountFromApi = data.results.unseen_count;
        }
      } else if (Array.isArray(data.notifications)) {
        // Another possible variant
        rawNotifications = data.notifications;
      }
    }

    const mapped: Notification[] = (rawNotifications || []).map(
      (item: any): Notification => ({
        id: String(item.id),
        type: item.title ?? "notification",
        title: item.title ?? "Notification",
        body: item.data?.message ?? item.message ?? "",
        data: item.data ?? {},
        read: !!item.is_read,
        created_at: item.created_at,
      })
    );

    return { items: mapped, unseenCount: unseenCountFromApi };
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Network error",
    });
  }
});

/* -----------------------------------
   Mark as Read Async (with guard)
----------------------------------- */
/**
 * markAsReadAsync now checks id pattern.
 * - If id appears to be a server id -> POST to server endpoint.
 * - If id is synthetic (summary, temp id) -> resolve immediately and update local state only.
 */
export const markAsReadAsync = createAsyncThunk<
  { id: string },
  { id: string },
  { rejectValue: { message: string } }
>("notifications/markAsReadAsync", async ({ id }, { rejectWithValue }) => {
  try {
    // if id is not a server id, skip HTTP call (it's a summary or synthetic id)
    if (!isServerId(id)) {
      // simply return success; reducer will handle marking local item read (if exists)
      return { id };
    }

    const token = localStorage.getItem("auth_access") || "";

    const res = await fetch(
      `https://api.eastmondvillas.com/api/notifications/list/${id}/`,
      {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      return rejectWithValue({
        message: txt || "Failed to mark notification read",
      });
    }

    return { id };
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Network error",
    });
  }
});

/* -----------------------------------
   Mark All as Read Async
----------------------------------- */
export const markAllAsReadAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: { message: string } }
>("notifications/markAllAsReadAsync", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("auth_access") || "";

    const res = await fetch(
      "https://api.eastmondvillas.com/api/notifications/mark-all-as-read/",
      {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      return rejectWithValue({
        message: txt || "Failed to mark all notifications as read",
      });
    }

    return;
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Network error",
    });
  }
});

/* -----------------------------------
   Slice
----------------------------------- */
const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      // FIX: Prevent adding 'unseen_notifications' type notifications
      // These are not real notifications, just count updates
      if (action.payload.type === 'unseen_notifications') {
        // We only update unreadCount from data if available
        if (action.payload.data?.count !== undefined) {
          state.unreadCount = action.payload.data.count;
        }
        // DO NOT add to items array - return early
        return;
      }
      
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        // Update unreadCount if new notification is unread
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      } else {
        // Check if read status is changing
        const wasUnread = !exists.read;
        const isUnread = !action.payload.read;
        
        Object.assign(exists, action.payload);
        
        // Update unreadCount if read status changed
        if (wasUnread && !isUnread) {
          // Became read - decrement count
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && isUnread) {
          // Became unread - increment count
          state.unreadCount += 1;
        }
      }
    },

    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, action.payload);
    },

    removeNotification(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && !item.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    // local synchronous mark-as-read (useful for optimistic updates)
    markAsReadLocal(state, action: PayloadAction<string>) {
      const id = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // local synchronous mark-all-as-read (optimistic update)
    markAllAsReadLocal(state) {
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    },

    clearAll(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.items = action.payload.items;
      if (
        typeof action.payload.unseenCount === "number" &&
        !Number.isNaN(action.payload.unseenCount)
      ) {
        state.unreadCount = action.payload.unseenCount;
      } else {
        state.unreadCount = state.items.filter((i) => !i.read).length;
      }
    });

    builder.addCase(markAsReadAsync.fulfilled, (state, action) => {
      const id = action.payload.id;
      // When thunk succeeds (or was a synthetic id), mark local item read if present
      const item = state.items.find((i) => i.id === id);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllAsReadAsync.fulfilled, (state) => {
      // Mark all items as read when the API call succeeds
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    });

    // optional: handle rejected to rollback optimistic UI if you implement optimistic updates
    builder.addCase(markAsReadAsync.rejected, () => {
      // no-op here; UI could show an error toast instead
    });
    
    builder.addCase(markAllAsReadAsync.rejected, () => {
      // no-op here; UI could show an error toast instead
    });
  },
});

export const {
  addNotification,
  setUnreadCount,
  removeNotification,
  markAsReadLocal,
  markAllAsReadLocal,
  clearAll,
} = slice.actions;

export default slice.reducer;