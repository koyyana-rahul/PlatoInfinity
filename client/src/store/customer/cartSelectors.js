// src/store/customer/cartSelectors.js
import { createSelector } from "@reduxjs/toolkit";

/* ============================
   BASE STATE
============================ */

export const selectCartState = (state) =>
  state.customerCart ?? {
    items: [],
    loading: false,
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

export const selectCart = createSelector(selectCartItems, (items) => ({
  items,
}));

/* ============================
   DERIVED (LIVE, INSTANT)
============================ */

// ✅ itemId → quantity map (stable)
export const selectQuantities = createSelector(selectCartItems, (items) => {
  const map = {};
  for (const item of items) {
    if (item?.branchMenuItemId) {
      map[item.branchMenuItemId] = item.quantity;
    }
  }
  return map;
});

// ✅ total quantity (updates instantly)
export const selectTotalQty = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + (i.quantity || 0), 0),
);

// ✅ subtotal (price × qty)
export const selectSubtotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0),
);

// ✅ total amount (future-proof for tax / discount)
export const selectTotalAmount = createSelector(selectSubtotal, (subtotal) =>
  Math.round(subtotal),
);

// ✅ loading
export const selectCartLoading = createSelector(
  selectCartState,
  (cart) => cart.loading,
);
