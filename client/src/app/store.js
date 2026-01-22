import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/auth/userSlice";
import brandReducer from "../store/brand/brandSlice";
import customerCartReducer from "../store/customer/cartSlice";
import customerOrdersReducer from "../store/customer/orderSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    brand: brandReducer,
    customerCart: customerCartReducer,
    customerOrders: customerOrdersReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;
