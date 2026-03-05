/**
 * useCustomerOrders.js
 * Hook to manage customer orders, order tracking, and order history
 */

import { useCallback, useEffect, useState } from "react";
import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import sessionManager from "../utils/sessionManager";

export function useCustomerOrders(sessionId, tableId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /**
   * Fetch all orders for session
   */
  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await Axios(customerApi.order.listBySession(sessionId));
      const ordersData = res.data?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /**
   * Fetch order details
   */
  const fetchOrderDetails = useCallback(async (orderId) => {
    if (!orderId) return null;

    try {
      const res = await Axios(customerApi.order.getDetails(orderId));
      const orderData = res.data?.data;
      setSelectedOrder(orderData);
      return orderData;
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError(err?.response?.data?.message || "Failed to load order details");
      return null;
    }
  }, []);

  /**
   * Get order by ID
   */
  const getOrderById = useCallback(
    (orderId) => {
      return orders.find((o) => o._id === orderId);
    },
    [orders],
  );

  /**
   * Calculate order progress
   */
  const getOrderProgress = useCallback((order) => {
    if (!order || !order.items) return 0;

    const totalItems = order.items.length;
    if (totalItems === 0) return 0;

    const readyItems = order.items.filter(
      (item) => item.itemStatus === "READY" || item.itemStatus === "SERVED",
    ).length;

    return Math.round((readyItems / totalItems) * 100);
  }, []);

  /**
   * Check if any order is active
   */
  const hasActiveOrders = useCallback(() => {
    return orders.some((o) =>
      ["NEW", "IN_PROGRESS", "READY"].includes(o.orderStatus),
    );
  }, [orders]);

  /**
   * Get total items across all orders
   */
  const getTotalItems = useCallback(() => {
    return orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
  }, [orders]);

  /**
   * Get estimated time for order
   */
  const getEstimatedTime = useCallback((order) => {
    if (!order) return null;

    const avgItemTime = 15; // minutes per item
    const itemCount = order.items?.length || 1;
    const estimatedMinutes = Math.max(10, (itemCount * avgItemTime) / 3);

    return Math.ceil(estimatedMinutes);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    selectedOrder,
    setSelectedOrder,
    fetchOrders,
    fetchOrderDetails,
    getOrderById,
    getOrderProgress,
    hasActiveOrders,
    getTotalItems,
    getEstimatedTime,
  };
}

export default useCustomerOrders;
