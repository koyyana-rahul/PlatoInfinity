import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";
import toast from "react-hot-toast";

const getTableId = () => {
  const path = window.location.pathname;
  const match = path.match(/\/table\/([^/]+)/i);
  if (match) return match[1];

  const searchParams = new URLSearchParams(window.location.search);
  const queryTableId = searchParams.get("tableId");
  if (queryTableId) return queryTableId;

  return localStorage.getItem("plato:lastTableId");
};

const getDeviceId = () => {
  let deviceId = localStorage.getItem("plato:deviceId");
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("plato:deviceId", deviceId);
  }
  return deviceId;
};

/* ===============================
   FETCH CART
================================ */
export const fetchCart = createAsyncThunk(
  "customerCart/fetch",
  async (payload = {}, { rejectWithValue }) => {
    try {
      const tableId = payload?.tableId || getTableId();
      const deviceId = getDeviceId();

      // Guard: avoid noisy 400s when table context is unavailable/invalid
      if (!tableId || !/^[a-f\d]{24}$/i.test(String(tableId))) {
        return { items: [], subtotal: 0, tax: 0, totalAmount: 0 };
      }

      // Important: do not block cart fetch on localStorage session keys.
      // Session keys may be absent after refresh in some flows, while the
      // backend still has an active table session and cart.

      const res = await Axios({
        ...customerApi.cart.get,
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });
      return res.data?.data || {};
    } catch (err) {
      const message = err?.response?.data?.message || "Fetch cart failed";

      // Session might have expired/closed; keep UI stable instead of failing loudly
      if (
        err?.response?.status === 400 &&
        /table|session|invalid/i.test(String(message))
      ) {
        return { items: [], subtotal: 0, tax: 0, totalAmount: 0 };
      }

      return rejectWithValue(message);
    }
  },
);

/* ===============================
   ADD TO CART
================================ */
export const addToCart = createAsyncThunk(
  "customerCart/add",
  async (
    { branchMenuItemId, quantity, preferences },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const tableId = getTableId();
      const deviceId = getDeviceId();

      if (!tableId) {
        return rejectWithValue("Table ID missing");
      }

      if (!branchMenuItemId) {
        return rejectWithValue("Item ID missing");
      }

      const res = await Axios({
        ...customerApi.cart.add,
        data: {
          tableId,
          deviceId,
          branchMenuItemId,
          quantity,
          preferences,
        },
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });
      dispatch(fetchCart());
      return res.data?.data;
    } catch (err) {
      const message = err?.response?.data?.message || "Add to cart failed";
      const details = err?.response?.data?.details;
      if (details) {
        // eslint-disable-next-line no-console
        console.error("Add to cart error details:", details);
      }
      toast.error(message);
      if (
        message.toLowerCase().includes("session") ||
        message.toLowerCase().includes("table")
      ) {
        toast.error("Please ask the waiter to open the table session.");
      }
      return rejectWithValue(message);
    }
  },
);

/* ===============================
   UPDATE CART ITEM
================================ */
export const updateCartItem = createAsyncThunk(
  "customerCart/update",
  async ({ cartItemId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const tableId = getTableId();
      const deviceId = getDeviceId();

      await Axios({
        ...customerApi.cart.update,
        data: { tableId, deviceId, cartItemId, quantity },
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });
      dispatch(fetchCart({ tableId }));
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
  async (cartItemId, { rejectWithValue, dispatch }) => {
    try {
      const tableId = getTableId();
      const deviceId = getDeviceId();

      await Axios({
        ...customerApi.cart.remove(cartItemId),
        data: { tableId, deviceId },
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });
      dispatch(fetchCart({ tableId }));
      return cartItemId;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Remove item failed",
      );
    }
  },
);

/* ===============================
   PLACE ORDER (PIN REQUIRED)
================================ */
export const placeOrder = createAsyncThunk(
  "customerOrders/place",
  async ({ tablePin, mode, customerLabel }, { rejectWithValue, dispatch }) => {
    try {
      if (!tablePin || tablePin.length !== 4) {
        return rejectWithValue("Invalid PIN");
      }

      const tableId = getTableId();
      const deviceId = getDeviceId();

      const res = await Axios({
        ...customerApi.order.place,
        data: { tablePin, mode, customerLabel, deviceId },
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });

      if (res.data?.data?.hold) {
        toast.info(
          "Order pending manager approval for large quantity. Please wait.",
          {
            duration: 5000,
            icon: "⏳",
          },
        );
      } else {
        toast.success("Order sent to kitchen!", { icon: "✅" });
      }

      dispatch(fetchCart({ tableId }));

      return res.data?.data;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to place order";
      toast.error(message);
      if (err?.response?.data?.isBlocked) {
        toast.error(
          `PIN locked. Try again in ${err?.response?.data?.minutesLeft || 15} minutes`,
        );
      }
      return rejectWithValue(message);
    }
  },
);

/* ===============================
   FETCH CUSTOMER ORDERS
================================ */
export const fetchCustomerOrders = createAsyncThunk(
  "customerOrders/fetch",
  async (sessionId, { rejectWithValue }) => {
    if (!sessionId) {
      return rejectWithValue("Session ID missing");
    }

    try {
      const tableId = getTableId();
      const deviceId = getDeviceId();

      const res = await Axios({
        ...customerApi.order.listBySession(sessionId),
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });
      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);
