// // src/store/commonSlice.ts
// import type { RootState } from "@/store";
// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// // import type { RootState } from "./store";

// // --- Config: API base ---
// const API_BASE =
//   (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, "") ||
//   (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:8888/api");

// // --- Helper: get token from state (assumes auth slice stores accessToken) ---
// function getAuthTokenFromState(getState: () => RootState): string | null {
//   try {
//     // Adjust if your auth slice uses different naming
//     const s = getState() as any;
//     return s?.auth?.accessToken ?? s?.auth?.token ?? null;
//   } catch (e) {
//     return null;
//   }
// }

// // --- Generic fetch helper with auth ---
// async function authFetch(input: RequestInfo, init: RequestInit = {}, token?: string | null) {
//   const headers = new Headers(init.headers ?? {});
//   headers.set("Accept", "application/json");
//   // For JSON requests
//   if (!(init.body instanceof FormData)) {
//     if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
//   }
//   if (token) headers.set("Authorization", `Bearer ${token}`);
//   const res = await fetch(input, { ...init, headers });
//   const text = await res.text();
//   // try parse JSON if possible
//   let json: any = null;
//   try {
//     json = text ? JSON.parse(text) : null;
//   } catch (e) {
//     // non-json body
//   }
//   if (!res.ok) {
//     const err = { status: res.status, body: json ?? text };
//     throw err;
//   }
//   return json;
// }

// // --- Types for slice state (simple / generic) ---
// type CommonState<T = any> = {
//   loading: boolean;
//   error: string | null;
//   data: T | null;
// };

// type ContactsState = {
//   list: any[]; // array of contact items
//   loading: boolean;
//   error: string | null;
// };

// type AnnouncementsState = {
//   list: any[];
//   loading: boolean;
//   creating: boolean;
//   createError: string | null;
//   error: string | null;
// };

// type ActivityLogState = {
//   list: any[];
//   loading: boolean;
//   error: string | null;
// };

// export const fetchAnnouncements = createAsyncThunk<any[]>(
//   "common/fetchAnnouncements",
//   async (_, { getState, rejectWithValue }) => {
//     const token = getAuthTokenFromState(getState as any);
//     try {
//       const url = `${API_BASE}/announcements/announcement/`;
//       const data = await authFetch(url, { method: "GET" }, token);
//       return Array.isArray(data) ? data : data?.results ?? data;
//     } catch (err: any) {
//       console.error("Failed to fetch announcements:", err);
//       return rejectWithValue(err);
//     }
//   }
// );

// export const createAnnouncement = createAsyncThunk<any, { title: string; body?: string }>(
//   "common/createAnnouncement",
//   async (payload, { getState, rejectWithValue }) => {
//     const token = getAuthTokenFromState(getState as any);
//     if (!token) {
//       console.error("Authentication missing. Please login.");
//       return rejectWithValue({ detail: "Authentication missing. Please login." });
//     }
//     try {
//       const url = `${API_BASE}/announcements/announcement/`;
//       const body = JSON.stringify(payload);
//       const data = await authFetch(url, { method: "POST", body }, token);
//       return data;
//     } catch (err: any) {
//       console.error("Failed to create announcement:", err);
//       return rejectWithValue(err);
//     }
//   }
// );

// export const fetchActivityLog = createAsyncThunk<any[]>(
//   "common/fetchActivityLog",
//   async (params: { ordering?: string; search?: string } | undefined, { getState, rejectWithValue }) => {
//     const token = getAuthTokenFromState(getState as any);
//     try {
//       let url = new URL(`${API_BASE}/activity-log/list/`);
//       if (params) {
//         if (params.ordering) url.searchParams.set("ordering", params.ordering);
//         if (params.search) url.searchParams.set("search", params.search);
//       }
//       const data = await authFetch(url.toString(), { method: "GET" }, token);
//       return Array.isArray(data) ? data : data?.results ?? data;
//     } catch (err: any) {
//       console.error("Failed to fetch activity log:", err);
//       return rejectWithValue(err);
//     }
//   }
// );

// export const fetchContacts = createAsyncThunk<any[]>(
//   "common/fetchContacts",
//   async (_, { getState, rejectWithValue }) => {
//     const token = getAuthTokenFromState(getState as any);
//     try {
//       const url = `${API_BASE}/list_vila/contect/`;
//       const data = await authFetch(url, { method: "GET" }, token);
//       return Array.isArray(data) ? data : data?.results ?? data;
//     } catch (err: any) {
//       console.error("Failed to fetch contacts:", err);
//       return rejectWithValue(err);
//     }
//   }
// );

// export const createContact = createAsyncThunk<any, { name?: string; email?: string; phone?: string; message?: string }>(
//   "common/createContact",
//   async (payload, { getState, rejectWithValue }) => {
//     const token = getAuthTokenFromState(getState as any);
//     try {
//       const url = `${API_BASE}/list_vila/contect/`;
//       // If backend expects form data, adapt accordingly; here we send JSON
//       const data = await authFetch(url, { method: "POST", body: JSON.stringify(payload) }, token);
//       return data;
//     } catch (err: any) {
//       console.error("Failed to create contact:", err);
//       return rejectWithValue(err);
//     }
//   }
// );

// export const updateContact = createAsyncThunk<any, { id: number | string; payload: any }>(
//   "common/updateContact",
//   async ({ id, payload }, { getState, rejectWithValue }) => {
//     const token = getAuthTokenFromState(getState as any);
//     if (!id) {
//       console.error("updateContact missing id");
//       return rejectWithValue({ detail: "Missing id" });
//     }
//     try {
//       const url = `${API_BASE}/list_vila/contect/${id}/`;
//       const data = await authFetch(url, { method: "PUT", body: JSON.stringify(payload) }, token);
//       return data;
//     } catch (err: any) {
//       console.error("Failed to update contact:", err);
//       return rejectWithValue(err);
//     }
//   }
// );

// // --- slice initial state ---
// const initialState = {
//   announcements: {
//     list: [],
//     loading: false,
//     creating: false,
//     createError: null,
//     error: null,
//   } as AnnouncementsState,
//   activityLog: { list: [], loading: false, error: null } as ActivityLogState,
//   contacts: { list: [], loading: false, error: null } as ContactsState,
//   generic: { loading: false, error: null, data: null } as CommonState,
// };

// const slice = createSlice({
//   name: "common",
//   initialState,
//   reducers: {
//     clearAnnouncements(state) {
//       state.announcements.list = [];
//       state.announcements.error = null;
//     },
//     clearActivityLog(state) {
//       state.activityLog.list = [];
//       state.activityLog.error = null;
//     },
//     clearContacts(state) {
//       state.contacts.list = [];
//       state.contacts.error = null;
//     },
//     setGenericData(state, action: PayloadAction<any>) {
//       state.generic.data = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     // fetchAnnouncements
//     builder.addCase(fetchAnnouncements.pending, (s) => {
//       s.announcements.loading = true;
//       s.announcements.error = null;
//     });
//     builder.addCase(fetchAnnouncements.fulfilled, (s, a) => {
//       s.announcements.loading = false;
//       s.announcements.list = a.payload ?? [];
//     });
//     builder.addCase(fetchAnnouncements.rejected, (s, a) => {
//       s.announcements.loading = false;
//       s.announcements.error = (a.payload as any)?.detail ?? String(a.error?.message ?? "Failed to load announcements");
//     });

//     // createAnnouncement
//     builder.addCase(createAnnouncement.pending, (s) => {
//       s.announcements.creating = true;
//       s.announcements.createError = null;
//     });
//     builder.addCase(createAnnouncement.fulfilled, (s, a) => {
//       s.announcements.creating = false;
//       // prepend created item
//       if (a.payload) s.announcements.list = [a.payload, ...s.announcements.list];
//     });
//     builder.addCase(createAnnouncement.rejected, (s, a) => {
//       s.announcements.creating = false;
//       s.announcements.createError = (a.payload as any)?.detail ?? String(a.error?.message ?? "Failed to create announcement");
//     });

//     // fetchActivityLog
//     builder.addCase(fetchActivityLog.pending, (s) => {
//       s.activityLog.loading = true;
//       s.activityLog.error = null;
//     });
//     builder.addCase(fetchActivityLog.fulfilled, (s, a) => {
//       s.activityLog.loading = false;
//       s.activityLog.list = a.payload ?? [];
//     });
//     builder.addCase(fetchActivityLog.rejected, (s, a) => {
//       s.activityLog.loading = false;
//       s.activityLog.error = (a.payload as any)?.detail ?? String(a.error?.message ?? "Failed to load activity log");
//     });

//     // fetchContacts
//     builder.addCase(fetchContacts.pending, (s) => {
//       s.contacts.loading = true;
//       s.contacts.error = null;
//     });
//     builder.addCase(fetchContacts.fulfilled, (s, a) => {
//       s.contacts.loading = false;
//       s.contacts.list = a.payload ?? [];
//     });
//     builder.addCase(fetchContacts.rejected, (s, a) => {
//       s.contacts.loading = false;
//       s.contacts.error = (a.payload as any)?.detail ?? String(a.error?.message ?? "Failed to load contacts");
//     });

//     // createContact
//     builder.addCase(createContact.pending, (s) => {
//       s.contacts.loading = true;
//       s.contacts.error = null;
//     });
//     builder.addCase(createContact.fulfilled, (s, a) => {
//       s.contacts.loading = false;
//       if (a.payload) s.contacts.list = [a.payload, ...s.contacts.list];
//     });
//     builder.addCase(createContact.rejected, (s, a) => {
//       s.contacts.loading = false;
//       s.contacts.error = (a.payload as any)?.detail ?? String(a.error?.message ?? "Failed to create contact");
//     });

//     // updateContact
//     builder.addCase(updateContact.pending, (s) => {
//       s.contacts.loading = true;
//       s.contacts.error = null;
//     });
//     builder.addCase(updateContact.fulfilled, (s, a) => {
//       s.contacts.loading = false;
//       if (a.payload) {
//         const idx = s.contacts.list.findIndex((c) => String((c as any).id) === String((a.payload as any).id));
//         if (idx >= 0) s.contacts.list[idx] = a.payload;
//         else s.contacts.list = [a.payload, ...s.contacts.list];
//       }
//     });
//     builder.addCase(updateContact.rejected, (s, a) => {
//       s.contacts.loading = false;
//       s.contacts.error = (a.payload as any)?.detail ?? String(a.error?.message ?? "Failed to update contact");
//     });
//   },
// });

// export const { clearAnnouncements, clearActivityLog, clearContacts, setGenericData } = slice.actions;

// // Selectors
// export const selectAnnouncements = (state: RootState) => state.common.announcements.list;
// export const selectAnnouncementsLoading = (state: RootState) => state.common.announcements.loading;
// export const selectAnnouncementsError = (state: RootState) => state.common.announcements.error;

// export const selectActivityLog = (state: RootState) => state.common.activityLog.list;
// export const selectActivityLogLoading = (state: RootState) => state.common.activityLog.loading;
// export const selectActivityLogError = (state: RootState) => state.common.activityLog.error;

// export const selectContacts = (state: RootState) => state.common.contacts.list;
// export const selectContactsLoading = (state: RootState) => state.common.contacts.loading;
// export const selectContactsError = (state: RootState) => state.common.contacts.error;

// export default slice.reducer;
