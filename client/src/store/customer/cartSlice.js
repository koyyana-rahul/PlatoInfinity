import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "./cartThunks";

const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: "customerCart",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    /* ================= FETCH CART ================= */
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;

        const cart = action.payload || {};
        state.items = cart.items || [];
        state.subtotal = cart.subtotal || 0;
        state.tax = cart.tax || 0;
        state.total = cart.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });

    /* ================= ADD TO CART ================= */
    builder.addCase(addToCart.fulfilled, (state, action) => {
      const item = action.payload;
      if (!item) return;

      const existing = state.items.find(
        (i) => i.branchMenuItemId === item.branchMenuItemId,
      );

      if (existing) {
        existing.quantity = item.quantity;
      } else {
        state.items.push(item);
      }
    });

    /* ================= UPDATE CART ITEM ================= */
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      const { cartItemId, quantity } = action.payload || {};
      if (!cartItemId) return;

      const item = state.items.find((i) => i._id === cartItemId);
      if (item) {
        item.quantity = quantity;
      }
    });

    /* ================= REMOVE CART ITEM ================= */
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      const cartItemId = action.payload;
      if (!cartItemId) return;

      state.items = state.items.filter((i) => i._id !== cartItemId);
    });
  },
});

export default cartSlice.reducer;
