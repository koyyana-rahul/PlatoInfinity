import { createSlice } from "@reduxjs/toolkit";
import { fetchBill } from "./billThunks";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const billSlice = createSlice({
  name: "customerBill",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBill.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default billSlice.reducer;
