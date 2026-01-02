import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/auth/userSlice";
import brandReducer from "../store/brand/brandSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    brand: brandReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;
