import { createSlice } from "@reduxjs/toolkit";
import { fetchCustomerOrders, placeOrder } from "./orderThunks";

const HAS_ORDERS_KEY = "plato:customerHasOrders";

const readHasOrders = () => {
  try {
    return localStorage.getItem(HAS_ORDERS_KEY) === "true";
  } catch {
    return false;
  }
};

const persistHasOrders = (value) => {
  try {
    localStorage.setItem(HAS_ORDERS_KEY, value ? "true" : "false");
  } catch {
    // ignore storage failures (private mode/quota)
  }
};

const initialState = {
  hasOrders: readHasOrders(),
  items: [],
  loading: false,
};

const customerOrdersSlice = createSlice({
  name: "customerOrders",
  initialState,
  reducers: {
    resetOrders(state) {
      state.hasOrders = false;
      state.items = [];
      persistHasOrders(false);
    },
  },
  extraReducers: (builder) => {
    /* ================= FETCH ORDERS ================= */
    builder
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;

        // ✅ survives refresh
        state.hasOrders = action.payload.length > 0;
        persistHasOrders(state.hasOrders);
      })
      .addCase(fetchCustomerOrders.rejected, (state) => {
        state.loading = false;
      });

    /* ================= PLACE ORDER ================= */
    builder.addCase(placeOrder.fulfilled, (state) => {
      state.hasOrders = true;
      persistHasOrders(true);
    });
  },
});

export const { resetOrders } = customerOrdersSlice.actions;
export default customerOrdersSlice.reducer;
