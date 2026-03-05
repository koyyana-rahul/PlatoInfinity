// src/store/customer/cartSelectors.js
import { createSelector } from "@reduxjs/toolkit";

/* ============================
   BASE STATE
============================ */

export const selectCartState = (state) =>
  state.customerCart ?? {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    totalAmount: 0,
    loading: false,
  };

const normalizeId = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return String(value);
};

/* ============================
   CORE DATA
============================ */

export const selectCartItems = createSelector(
  selectCartState,
  (cart) => cart.items || [],
);

/* ============================
   CART OBJECT (FOR PAGES)
   ⚠️ No totals stored
============================ */

export const selectCart = createSelector(selectCartState, (cart) => ({
  items: cart.items || [],
  subtotal: Number(cart.subtotal || 0),
  tax: Number(cart.tax || 0),
  total: Number(cart.totalAmount ?? cart.total ?? 0),
}));

/* ============================
   DERIVED (LIVE, INSTANT)
============================ */

// ✅ itemId → quantity map (stable)
export const selectQuantities = createSelector(selectCartItems, (items) => {
  const map = {};
  for (const item of items) {
    if (item?.branchMenuItemId) {
      map[normalizeId(item.branchMenuItemId)] = item.quantity;
    }
  }
  return map;
});

// ✅ total quantity (updates instantly)
export const selectTotalQty = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + (i.quantity || 0), 0),
);

// ✅ subtotal (price × qty)
export const selectSubtotal = createSelector(
  selectCartState,
  selectCartItems,
  (cart, items) => {
    if (Number.isFinite(cart?.subtotal)) return Number(cart.subtotal);
    return items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
      0,
    );
  },
);

export const selectTax = createSelector(
  selectCartState,
  selectCartItems,
  (cart, items) => {
    if (Number.isFinite(cart?.tax)) return Number(cart.tax);
    return items.reduce(
      (sum, i) =>
        sum + ((i.price || 0) * (i.quantity || 0) * (i.taxPercent || 0)) / 100,
      0,
    );
  },
);

// ✅ total amount (future-proof for tax / discount)
export const selectTotalAmount = createSelector(
  selectCartState,
  selectSubtotal,
  selectTax,
  (cart, subtotal, tax) => {
    if (Number.isFinite(cart?.totalAmount)) return Number(cart.totalAmount);
    if (Number.isFinite(cart?.total)) return Number(cart.total);
    return Math.round(subtotal + tax);
  },
);

// ✅ loading
export const selectCartLoading = createSelector(
  selectCartState,
  (cart) => cart.loading,
);
