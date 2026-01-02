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

  isAuthenticated: false,
  isHydrated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialValue,
  reducers: {
    setUserDetails: (state, action) => {
      Object.assign(state, action.payload);
      state.isAuthenticated = true;
    },

    updateAvatar: (state, action) => {
      state.avatar = action.payload;
    },

    logout: (state) => {
      Object.assign(state, initialValue);
      state.isHydrated = true; // IMPORTANT
    },

    markHydrated: (state) => {
      state.isHydrated = true;
    },
  },
});

export const { setUserDetails, logout, updateAvatar, markHydrated } =
  userSlice.actions;

export default userSlice.reducer;
