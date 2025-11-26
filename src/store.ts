
import { configureStore } from "@reduxjs/toolkit";
import touristReducer from "../src/features/tourist/touristSlice";
import authReducer from "./features/Auth/authSlice";
// import commonReducer from "./features/CommonSlice";

import { propertiesAndBookingReducer } from "./features/Properties/PropertiesSlice"



export const store = configureStore({
  reducer: {
    tourist: touristReducer,
    auth: authReducer,
    propertyBooking: propertiesAndBookingReducer,
    // common: commonReducer,



   



  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
