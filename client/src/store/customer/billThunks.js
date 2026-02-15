import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../api/axios";

export const fetchBill = createAsyncThunk(
  "customerBill/fetchBill",
  async (billId, { rejectWithValue }) => {
    try {
      const res = await Axios.get(`/api/bills/${billId}`);
      if (res.data?.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data?.message || "Failed to fetch bill");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);
