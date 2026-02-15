import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  _id: "",
  name: "",
  slug: "",
  logoUrl: "",
  storeName: "",
  address: "",
  phone: "",
  email: "",
  description: "",
  gst: "",
  fssai: "",
  serviceCharge: 0,
  taxRate: 0,
  deliveryFee: 0,
};

const brandSlice = createSlice({
  name: "brand",
  initialState: initialValue,
  reducers: {
    setBrandDetails: (state, action) => {
      Object.assign(state, action.payload);
    },
    updateBrandSettings: (state, action) => {
      Object.assign(state, action.payload);
    },
    clearBrand: (state) => {
      Object.assign(state, initialValue);
    },
  },
});

export const { setBrandDetails, updateBrandSettings, clearBrand } =
  brandSlice.actions;
export default brandSlice.reducer;
