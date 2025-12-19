import { createSlice } from "@reduxjs/toolkit";
import { time } from "framer-motion";

const initialValue = {
  _id: "",
  name: "",
  ownerId: "",
  logoUrl: "",
  timezone: "Asia/Kolkata",
  defaultTaxes: [],
  meta: {},
};

const brandSlice = createSlice({
  name: "brand",
  initialState: initialValue,
  reducers: {
    setBrandDetails: (state, action) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.ownerId = action.payload.ownerId;
      state.logoUrl = action.payload.logoUrl;
      state.timezone = action.payload.timezone;
      state.defaultTaxes = action.payload.defaultTaxes;
      state.meta = action.payload.meta;
    },
  },
});

export const { setBrandDetails } = brandSlice.actions;

export default brandSlice.reducer;
