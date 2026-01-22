import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

/* ===============================
   FETCH CUSTOMER ORDERS
   payload: sessionId
================================ */
export const fetchCustomerOrders = createAsyncThunk(
  "customerOrders/fetch",
  async (sessionId, { rejectWithValue }) => {
    if (!sessionId) {
      return rejectWithValue("Session ID missing");
    }

    try {
      const res = await Axios(customerApi.order.listBySession(sessionId));
      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

/* ===============================
   PLACE ORDER
================================ */
export const placeOrder = createAsyncThunk(
  "customerOrders/place",
  async (_, { rejectWithValue }) => {
    try {
      const res = await Axios(customerApi.order.place);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to place order",
      );
    }
  },
);
