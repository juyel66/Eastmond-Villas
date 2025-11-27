import { configureStore } from "@reduxjs/toolkit";
import touristReducer from "../src/features/tourist/touristSlice";
import authReducer from "./features/Auth/authSlice";
import { propertiesAndBookingReducer } from "./features/Properties/PropertiesSlice";
import notificationsReducer from "./features/notificationsSlice";

export const store = configureStore({
  reducer: {
    tourist: touristReducer,
    auth: authReducer,
    propertyBooking: propertiesAndBookingReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
