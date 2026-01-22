import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

/* ===============================
   FETCH CART
================================ */
export const fetchCart = createAsyncThunk(
  "customerCart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Axios(customerApi.cart.get);
      return res.data?.data || {};
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Fetch cart failed",
      );
    }
  },
);

/* ===============================
   ADD TO CART
================================ */
export const addToCart = createAsyncThunk(
  "customerCart/add",
  async ({ branchMenuItemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await Axios({
        ...customerApi.cart.add,
        data: { branchMenuItemId, quantity },
      });
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Add to cart failed",
      );
    }
  },
);

/* ===============================
   UPDATE CART ITEM
================================ */
export const updateCartItem = createAsyncThunk(
  "customerCart/update",
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      await Axios({
        ...customerApi.cart.update,
        data: { cartItemId, quantity },
      });
      return { cartItemId, quantity };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Update cart failed",
      );
    }
  },
);

/* ===============================
   REMOVE CART ITEM
================================ */
export const removeCartItem = createAsyncThunk(
  "customerCart/remove",
  async (cartItemId, { rejectWithValue }) => {
    try {
      await Axios(customerApi.cart.remove(cartItemId));
      return cartItemId;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Remove item failed",
      );
    }
  },
);
