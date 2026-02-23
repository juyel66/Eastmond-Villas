
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  read: boolean;
  created_at?: string;
}


interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};


const isServerId = (id: string) => {
  if (!id) return false;
 
  if (/^\d+$/.test(id)) return true;

  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      id
    )
  )
    return true;

  return false;
};



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
    
      rawNotifications = data;
    } else if (data && typeof data === "object") {
   
      if (data.results && typeof data.results === "object") {
        if (Array.isArray(data.results.notifications)) {
          rawNotifications = data.results.notifications;
        }
        if (typeof data.results.unseen_count === "number") {
          unseenCountFromApi = data.results.unseen_count;
        }
      } else if (Array.isArray(data.notifications)) {
       
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


export const markAsReadAsync = createAsyncThunk<
  { id: string },
  { id: string },
  { rejectValue: { message: string } }
>("notifications/markAsReadAsync", async ({ id }, { rejectWithValue }) => {
  try {
    
    if (!isServerId(id)) {
      
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


const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
    
      if (action.payload.type === 'unseen_notifications') {
 
        if (action.payload.data?.count !== undefined) {
          state.unreadCount = action.payload.data.count;
        }
      
        return;
      }
      
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
       
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      } else {
        
        const wasUnread = !exists.read;
        const isUnread = !action.payload.read;
        
        Object.assign(exists, action.payload);
        
       
        if (wasUnread && !isUnread) {
         
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && isUnread) {
         
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

   
    markAsReadLocal(state, action: PayloadAction<string>) {
      const id = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    
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
     
      const item = state.items.find((i) => i.id === id);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllAsReadAsync.fulfilled, (state) => {
    
      state.items.forEach((item) => {
        item.read = true;
      });
      state.unreadCount = 0;
    });

   
    builder.addCase(markAsReadAsync.rejected, () => {
     
    });
    
    builder.addCase(markAllAsReadAsync.rejected, () => {
      
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