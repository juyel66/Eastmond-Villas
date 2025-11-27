// // src/store/notificationsSlice.ts
// import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

// export interface Notification {
//   id: string;
//   type: string;
//   title?: string;
//   body?: string;
//   data?: any;
//   read: boolean;
//   created_at?: string;
// }

// interface NotificationsState {
//   items: Notification[];
//   unreadCount: number;
// }

// const LOCAL_KEY = "app_notifications_v1";

// const loadFromLocal = (): NotificationsState => {
//   try {
//     const raw = localStorage.getItem(LOCAL_KEY);
//     if (!raw) return { items: [], unreadCount: 0 };
//     const parsed = JSON.parse(raw) as Notification[];
//     const unreadCount = parsed.filter((n) => !n.read).length;
//     return { items: parsed, unreadCount };
//   } catch {
//     return { items: [], unreadCount: 0 };
//   }
// };

// const saveToLocal = (items: Notification[]) => {
//   try {
//     localStorage.setItem(LOCAL_KEY, JSON.stringify(items.slice(0, 200))); // keep recent 200
//   } catch {
//     // fail silently
//   }
// };

// const initialState: NotificationsState = loadFromLocal();

// const slice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {
//     addNotification(state, action: PayloadAction<Notification>) {
//       // dedupe by id
//       const exists = state.items.find((i) => i.id === action.payload.id);
//       if (!exists) {
//         state.items.unshift(action.payload); // newest first
//         if (!action.payload.read) state.unreadCount += 1;
//         saveToLocal(state.items);
//       } else {
//         // optionally update existing item
//         Object.assign(exists, action.payload);
//         saveToLocal(state.items);
//       }
//     },
//     markAsRead(state, action: PayloadAction<string>) {
//       const id = action.payload;
//       const item = state.items.find((i) => i.id === id);
//       if (item && !item.read) {
//         item.read = true;
//         state.unreadCount = Math.max(0, state.unreadCount - 1);
//         saveToLocal(state.items);
//       }
//     },
//     markAllRead(state) {
//       state.items.forEach((i) => (i.read = true));
//       state.unreadCount = 0;
//       saveToLocal(state.items);
//     },
//     setNotifications(state, action: PayloadAction<Notification[]>) {
//       state.items = [...action.payload].sort((a, b) => {
//         return (b.created_at || "").localeCompare(a.created_at || "");
//       });
//       state.unreadCount = state.items.filter((i) => !i.read).length;
//       saveToLocal(state.items);
//     },
//     removeNotification(state, action: PayloadAction<string>) {
//       state.items = state.items.filter((i) => i.id !== action.payload);
//       state.unreadCount = state.items.filter((i) => !i.read).length;
//       saveToLocal(state.items);
//     },
//     clearNotifications(state) {
//       state.items = [];
//       state.unreadCount = 0;
//       saveToLocal(state.items);
//     },
//   },
// });

// export const {
//   addNotification,
//   markAsRead,
//   markAllRead,
//   setNotifications,
//   removeNotification,
//   clearNotifications,
// } = slice.actions;

// export default slice.reducer;





















// src/store/notificationsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  type: string;
  title?: string;
  body?: string;
  data?: any;
  read: boolean;
  created_at?: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

// In-memory only (no localStorage persistence)
const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      // dedupe by id
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload); // newest first
        if (!action.payload.read) state.unreadCount += 1;
      } else {
        // optionally update existing item
        Object.assign(exists, action.payload);
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const id = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.items.forEach((i) => (i.read = true));
      state.unreadCount = 0;
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.items = [...action.payload].sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || "")
      );
      state.unreadCount = state.items.filter((i) => !i.read).length;
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.unreadCount = state.items.filter((i) => !i.read).length;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllRead,
  setNotifications,
  removeNotification,
  clearNotifications,
} = slice.actions;

export default slice.reducer;


