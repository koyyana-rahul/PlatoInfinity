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
  totalAmount: 0,
  loading: false,
};

function normalizeId(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return String(value);
}

function recomputeTotals(state) {
  const subtotal = (state.items || []).reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0,
  );
  const tax = (state.items || []).reduce(
    (sum, i) =>
      sum + ((i.price || 0) * (i.quantity || 0) * (i.taxPercent || 0)) / 100,
    0,
  );
  state.subtotal = subtotal;
  state.tax = tax;
  state.total = subtotal + tax;
  state.totalAmount = state.total;
}

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
        state.totalAmount = state.total;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });

    /* ================= ADD TO CART ================= */
    builder.addCase(addToCart.fulfilled, (state, action) => {
      const item = action.payload;
      if (!item) return;

      const incomingId = normalizeId(item.branchMenuItemId);
      const existing = state.items.find(
        (i) => normalizeId(i.branchMenuItemId) === incomingId,
      );

      if (existing) {
        existing.quantity = item.quantity;
      } else {
        state.items.push(item);
      }

      recomputeTotals(state);
    });

    /* ================= UPDATE CART ITEM ================= */
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      const { cartItemId, quantity } = action.payload || {};
      if (!cartItemId) return;

      const item = state.items.find((i) => i._id === cartItemId);
      if (item) {
        item.quantity = quantity;
      }

      recomputeTotals(state);
    });

    /* ================= REMOVE CART ITEM ================= */
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      const cartItemId = action.payload;
      if (!cartItemId) return;

      state.items = state.items.filter((i) => i._id !== cartItemId);
      recomputeTotals(state);
    });
  },
});

export default cartSlice.reducer;
