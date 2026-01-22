import { createSlice } from "@reduxjs/toolkit";
import { fetchCustomerOrders, placeOrder } from "./orderThunks";

const initialState = {
  hasOrders: false,
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
      })
      .addCase(fetchCustomerOrders.rejected, (state) => {
        state.loading = false;
      });

    /* ================= PLACE ORDER ================= */
    builder.addCase(placeOrder.fulfilled, (state) => {
      state.hasOrders = true;
    });
  },
});

export const { resetOrders } = customerOrdersSlice.actions;
export default customerOrdersSlice.reducer;
