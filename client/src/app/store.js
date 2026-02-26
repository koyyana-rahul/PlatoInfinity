import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/auth/userSlice";
import brandReducer from "../store/brand/brandSlice";
import sessionReducer from "../store/sessionSlice";
import customerCartReducer from "../store/customer/cartSlice";
import customerOrdersReducer from "../store/customer/orderSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    brand: brandReducer,
    session: sessionReducer,
    customerCart: customerCartReducer,
    customerOrders: customerOrdersReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;
