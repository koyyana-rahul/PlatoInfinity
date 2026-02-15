import { createSelector } from "@reduxjs/toolkit";

export const selectCustomerBillState = (state) =>
  state.customerBill ?? {
    data: null,
    loading: false,
    error: null,
  };

export const selectBillData = createSelector(
  selectCustomerBillState,
  (bill) => bill.data,
);

export const selectBillLoading = createSelector(
  selectCustomerBillState,
  (bill) => bill.loading,
);

export const selectBillError = createSelector(
  selectCustomerBillState,
  (bill) => bill.error,
);
