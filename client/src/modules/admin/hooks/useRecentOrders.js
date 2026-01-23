import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * Custom hook to fetch and manage recent orders
 * Handles API calls, real-time socket updates
 */
export const useRecentOrders = (timeRange, restaurantId = null) => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getRecentOrders(
        10,
        timeRange,
        restaurantId,
      );

      if (response?.data && Array.isArray(response.data)) {
        setRecentOrders(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err.message);
      setError(
        err?.response?.data?.message || err.message || "Failed to fetch orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [timeRange, restaurantId]);

  // Update orders from socket event
  const addRecentOrder = (order) => {
    setRecentOrders((prev) => [order, ...prev.slice(0, 9)]);
  };

  return {
    recentOrders,
    loading,
    error,
    setRecentOrders,
    addRecentOrder,
    refetch: fetchOrders,
  };
};
