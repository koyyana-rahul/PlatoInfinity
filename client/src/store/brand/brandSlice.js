import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  _id: "",
  name: "",
  slug: "",
  logoUrl: "",
};

const brandSlice = createSlice({
  name: "brand",
  initialState: initialValue,
  reducers: {
    setBrandDetails: (state, action) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.slug = action.payload.slug;
      state.logoUrl = action.payload.logoUrl;
    },
    clearBrand: (state) => {
      state._id = "";
      state.name = "";
      state.slug = "";
      state.logoUrl = "";
    },
  },
});

export const { setBrandDetails, clearBrand } = brandSlice.actions;
export default brandSlice.reducer;
