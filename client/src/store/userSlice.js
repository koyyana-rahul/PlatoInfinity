import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  _id: "",
  name: "",
  email: "",
  staffPin: "",
  role: "",
  brandId: "",
  restaurantId: "",
  kitchenStationId: "",
  isActive: "",
  avatar: "",
  mobile: "",
};

const userSlice = createSlice({
  name: "user",
  initialState: initialValue,
  reducers: {
    setUserDetails: (state, action) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.staffPin = action.payload.staffPin;
      state.role = action.payload.role;
      state.brandId = action.payload.brandId;
      state.restaurantId = action.payload.restaurantId;
      state.kitchenStationId = action.payload.kitchenStationId;
      state.isActive = action.payload.isActive;
      state.avatar = action.payload.avatar;
      state.mobile = action.payload.mobile;
    },
    updatedvatar: (state, action) => {
      state.avatar = action.payload;
    },
    logout: (state, action) => {
      state._id = "";
      state.name = "";
      state.email = "";
      state.staffPin = "";
      state.role = "";
      state.brandId = "";
      state.restaurantId = "";
      state.kitchenStationId = "";
      state.isActive = "";
      state.avatar = "";
      state.mobile = "";
    },
  },
});

export const { setUserDetails, logout, updatedvatar } = userSlice.actions;

export default userSlice.reducer;
