import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import brandReducer from "./brandSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    brand: brandReducer,
  },
});
