/**
 * useOrders.js
 *
 * Custom React hook for order management:
 * - Place orders with idempotency
 * - Track order status in real-time
 * - Handle failures and retries
 * - Receive kitchen updates
 */

import { useState, useCallback, useEffect } from "react";
import Axios from "../api/axios";
import orderApi, { generateIdempotencyKey } from "../api/order.api";
import customerApi from "../api/customer.api";
import toast from "react-hot-toast";
import { socketService } from "../api/socket.service";

export function useOrders(sessionId, restaurantId, tableId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  /* ========== FETCH ORDERS ========== */
  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const res = await Axios(orderApi.listBySession(sessionId));

      const ordersList = res.data?.data || [];
      setOrders(ordersList);

      console.log(`📋 Orders fetched: ${ordersList.length} orders`);
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      // Non-critical - orders can be retried
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /* ========== PLACE ORDER (WITH IDEMPOTENCY) ========== */
  const placeOrder = useCallback(
    async (paymentMethod = "CASH") => {
      if (!sessionId || !restaurantId || !tableId) {
        toast.error("Invalid session");
        return false;
      }

      try {
        setPlacingOrder(true);
        setOrderError("");

        // Generate unique idempotency key to prevent duplicates
        const idempotencyKey = generateIdempotencyKey();
        console.log(
          "🆔 Idempotency key:",
          idempotencyKey.substring(0, 8) + "...",
        );

        const res = await Axios({
          ...customerApi.order.place,
          data: {
            sessionId,
            restaurantId,
            tableId,
            paymentMethod,
            idempotencyKey,
          },
          headers: {
            "idempotency-key": idempotencyKey,
          },
        });

        if (res.data?.success) {
          const orderData = res.data?.data;

          console.log("✅ Order placed successfully:", orderData.orderId);
          toast.success(`Order placed! Total: ₹${orderData.totalAmount}`);

          // Refresh orders
          await fetchOrders();

          return {
            success: true,
            orderId: orderData.orderId,
            totalAmount: orderData.totalAmount,
            idempotencyKey,
          };
        }
      } catch (err) {
        const message = err?.response?.data?.message || "Failed to place order";

        console.error("❌ Order placement failed:", message);
        setOrderError(message);

        // Check if order was already placed (idempotency)
        if (err?.response?.status === 409) {
          toast.info("Order already placed. Retrieving details...");
          await fetchOrders();
          return { success: true, alreadyPlaced: true };
        }

        toast.error(message);
        return false;
      } finally {
        setPlacingOrder(false);
      }
    },
    [sessionId, restaurantId, tableId, fetchOrders],
  );

  /* ========== RETRY FAILED ORDER ========== */
  const retryOrderPlacement = useCallback(
    async (idempotencyKey) => {
      try {
        setPlacingOrder(true);

        const res = await Axios({
          ...customerApi.order.retry,
          data: {
            sessionId,
            restaurantId,
            idempotencyKey,
          },
        });

        if (res.data?.success) {
          toast.success("Order placed successfully!");
          await fetchOrders();
          return true;
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to retry order placement",
        );
        return false;
      } finally {
        setPlacingOrder(false);
      }
    },
    [sessionId, restaurantId, fetchOrders],
  );

  /* ========== GET ORDER DETAILS ========== */
  const getOrderDetails = useCallback(async (orderId) => {
    try {
      const res = await Axios(orderApi.getDetails(orderId));
      return res.data?.data || null;
    } catch (err) {
      console.error("❌ Failed to fetch order details:", err);
      return null;
    }
  }, []);

  /* ========== LISTEN FOR REAL-TIME ORDER UPDATES ========== */
  useEffect(() => {
    socketService.onOrderStatusChanged((updatedOrder) => {
      console.log("📡 Order status updated:", updatedOrder);

      // Update local orders list
      setOrders((prevOrders) => {
        const idx = prevOrders.findIndex((o) => o._id === updatedOrder._id);
        if (idx >= 0) {
          const newOrders = [...prevOrders];
          newOrders[idx] = updatedOrder;
          return newOrders;
        }
        return prevOrders;
      });
    });

    socketService.onOrderItemStatusChanged((itemUpdate) => {
      console.log("📡 Order item status changed:", itemUpdate);

      // Update order item status in local state
      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order._id === itemUpdate.orderId) {
            const newItems = [...(order.items || [])];
            newItems[itemUpdate.itemIndex] = {
              ...newItems[itemUpdate.itemIndex],
              itemStatus: itemUpdate.newStatus,
            };
            return { ...order, items: newItems };
          }
          return order;
        });
      });
    });

    return () => {
      socketService.offOrderStatusChanged();
      socketService.offOrderItemStatusChanged();
    };
  }, []);

  /* ========== INITIAL LOAD ========== */
  useEffect(() => {
    if (sessionId) {
      fetchOrders();
    }
  }, [sessionId, fetchOrders]);

  return {
    orders,
    loading,
    placingOrder,
    orderError,

    // Methods
    fetchOrders,
    placeOrder,
    retryOrderPlacement,
    getOrderDetails,
  };
}

export default useOrders;
