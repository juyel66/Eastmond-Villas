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
 * - Accepts: numeric strings ("1725"), UUIDs (hex-4-4-4-12), or typical server ids.
 * - Rejects: synthetic ids like "summary-12345", "notif-<ts>-<rand>"
 */
const isServerId = (id: string) => {
  if (!id) return false;
  // numeric id
  if (/^\d+$/.test(id)) return true;
  // UUID v4-ish
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) return true;
  // other server-style patterns you may want to accept — add here if needed
  return false;
};

/* -----------------------------------
   Fetch All Notifications
----------------------------------- */
export const fetchNotifications = createAsyncThunk<
  Notification[],
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
      return rejectWithValue({ message: text || "Failed to fetch notifications" });
    }

    const data = await res.json();

    // map API → Notification shape
    const mapped = (data || []).map((item: any) => ({
      id: String(item.id),
      type: item.title ?? "notification",
      title: item.title ?? "Notification",
      body: item.data?.message ?? item.message ?? "",
      data: item.data ?? {},
      read: !!item.is_read,
      created_at: item.created_at,
    }));

    return mapped;
  } catch (err: any) {
    return rejectWithValue({ message: err.message || "Network error" });
  }
});

/* -----------------------------------
   Mark as Read Async (with guard)
----------------------------------- */
/**
 * markAsReadAsync now checks id pattern.
 * - If id appears to be a server id -> POST to server endpoint.
 * - If id is synthetic (summary, temp id) -> resolve immediately and update local state only.
 *
 * Adjust endpoint path if your backend uses different URL.
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

    // Call actual backend endpoint for marking read
    // Confirm your backend path; current convention used earlier:
    // POST https://api.eastmondvillas.com/api/notifications/{id}/mark-read/
    const res = await fetch(
      `https://api.eastmondvillas.com/api/notifications/${id}/mark-read/`,
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
      return rejectWithValue({ message: txt || "Failed to mark notification read" });
    }

    return { id };
  } catch (err: any) {
    return rejectWithValue({ message: err.message || "Network error" });
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
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      } else {
        Object.assign(exists, action.payload);
      }
      state.unreadCount = state.items.filter((i) => !i.read).length;
    },

    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },

    removeNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.unreadCount = state.items.filter((i) => !i.read).length;
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

    clearAll(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((i) => !i.read).length;
    });

    builder.addCase(markAsReadAsync.fulfilled, (state, action) => {
      const id = action.payload.id;
      // When thunk succeeds (or was a synthetic id), mark local item read if present
      const item = state.items.find((i) => i.id === id);
      if (item && !item.read) {
        item.read = true;
      }
      state.unreadCount = state.items.filter((i) => !i.read).length;
    });

    // optional: handle rejected to rollback optimistic UI if you implement optimistic updates
    builder.addCase(markAsReadAsync.rejected, (state) => {
      // no-op here; UI could show an error toast instead
    });
  },
});

export const {
  addNotification,
  setUnreadCount,
  removeNotification,
  markAsReadLocal,
  clearAll,
} = slice.actions;

export default slice.reducer;
