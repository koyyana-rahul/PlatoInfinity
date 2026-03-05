import { createSelector } from "@reduxjs/toolkit";

export const selectCustomerOrdersState = (state) =>
  state.customerOrders ?? {
    hasOrders: false,
    items: [],
    loading: false,
  };

/**
 * ✅ Orders exist if backend returned at least 1 order
 * This survives refresh.
 */
export const selectHasOrders = createSelector(
  selectCustomerOrdersState,
  (orders) =>
    Boolean(orders?.hasOrders) ||
    (Array.isArray(orders?.items) && orders.items.length > 0),
);
