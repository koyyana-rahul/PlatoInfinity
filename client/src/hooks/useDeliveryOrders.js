import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import * as deliveryAPI from "../api/delivery.api";
import { toast } from "react-hot-toast";

/**
 * Custom hook for managing delivery orders
 * Handles: Creating, listing, tracking, and updating delivery orders
 * Real-time integration with socket events
 */
export const useDeliveryOrders = (restaurantId) => {
  // State management
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [partnerOrders, setPartnerOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "PREPARING",
    platform: null,
    page: 1,
    limit: 10,
  });

  const { socket } = useSocket();
  const socketRef = useRef(null);

  /**
   * Load delivery orders with filters
   */
  const loadDeliveryOrders = useCallback(
    async (newFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const appliedFilters = { ...filters, ...newFilters };
        setFilters(appliedFilters);

        const response = await deliveryAPI.listDeliveryOrders(
          restaurantId,
          appliedFilters,
        );

        setDeliveryOrders(response.data.data);
        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load orders";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, filters],
  );

  /**
   * Get specific delivery order details
   */
  const getDeliveryOrderDetail = useCallback(
    async (orderId) => {
      try {
        setLoading(true);
        const response = await deliveryAPI.getDeliveryOrderDetail(
          restaurantId,
          orderId,
        );
        setSelectedOrder(response.data.data);
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load order";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  /**
   * Update delivery order status
   */
  const updateOrderStatus = useCallback(
    async (orderId, status, note = null) => {
      try {
        setLoading(true);
        const response = await deliveryAPI.updateDeliveryOrderStatus(
          restaurantId,
          orderId,
          { status, note },
        );

        // Update local state
        setDeliveryOrders((orders) =>
          orders.map((order) =>
            order._id === orderId ? response.data.data : order,
          ),
        );

        if (selectedOrder?._id === orderId) {
          setSelectedOrder(response.data.data);
        }

        toast.success(`Order status updated to ${status}`);
        return response.data.data;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to update status";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, selectedOrder],
  );

  /**
   * Assign delivery partner to order
   */
  const assignDeliveryPartner = useCallback(
    async (orderId, deliveryPartnerId, estimatedDeliveryTime = null) => {
      try {
        setLoading(true);
        const response = await deliveryAPI.assignDeliveryPartner(
          restaurantId,
          orderId,
          { deliveryPartnerId, estimatedDeliveryTime },
        );

        setDeliveryOrders((orders) =>
          orders.map((order) =>
            order._id === orderId ? response.data.data : order,
          ),
        );

        if (selectedOrder?._id === orderId) {
          setSelectedOrder(response.data.data);
        }

        toast.success("Delivery partner assigned successfully");
        return response.data.data;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to assign partner";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, selectedOrder],
  );

  /**
   * Get orders assigned to current delivery partner
   */
  const getPartnerOrders = useCallback(
    async (partnerFilters = {}) => {
      try {
        setLoading(true);
        const response = await deliveryAPI.getDeliveryPartnerOrders(
          restaurantId,
          {
            status: "OUT_FOR_DELIVERY,NEARBY",
            ...partnerFilters,
          },
        );

        setPartnerOrders(response.data.data);
        return response.data.data;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load partner orders";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  /**
   * Update delivery partner location for tracking
   */
  const updatePartnerLocation = useCallback(
    async (orderId, latitude, longitude) => {
      try {
        await deliveryAPI.updateDeliveryPartnerLocation(restaurantId, orderId, {
          latitude,
          longitude,
        });
        return true;
      } catch (err) {
        console.error("Failed to update location:", err);
        return false;
      }
    },
    [restaurantId],
  );

  /**
   * Mark delivery as completed
   */
  const completeDelivery = useCallback(
    async (
      orderId,
      deliveryPartnerRating = null,
      deliveryPartnerReview = null,
    ) => {
      try {
        setLoading(true);
        const response = await deliveryAPI.completeDelivery(
          restaurantId,
          orderId,
          { deliveryPartnerRating, deliveryPartnerReview },
        );

        setDeliveryOrders((orders) =>
          orders.map((order) =>
            order._id === orderId ? response.data.data : order,
          ),
        );

        if (selectedOrder?._id === orderId) {
          setSelectedOrder(response.data.data);
        }

        toast.success("Delivery completed successfully");
        return response.data.data;
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to complete delivery";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, selectedOrder],
  );

  /**
   * Cancel delivery order
   */
  const cancelOrder = useCallback(
    async (orderId, cancelledBy, cancelReason = null, refundAmount = 0) => {
      try {
        setLoading(true);
        const response = await deliveryAPI.cancelDeliveryOrder(
          restaurantId,
          orderId,
          { cancelledBy, cancelReason, refundAmount },
        );

        setDeliveryOrders((orders) =>
          orders.filter((order) => order._id !== orderId),
        );

        if (selectedOrder?._id === orderId) {
          setSelectedOrder(null);
        }

        toast.success("Order cancelled successfully");
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || "Failed to cancel order";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, selectedOrder],
  );

  /**
   * Load summary and analytics
   */
  const loadSummary = useCallback(
    async (startDate = null, endDate = null) => {
      try {
        const response = await deliveryAPI.getDeliveryOrdersSummary(
          restaurantId,
          { startDate, endDate },
        );
        setSummary(response.data.data);
        return response.data.data;
      } catch (err) {
        console.error("Failed to load summary:", err);
        return null;
      }
    },
    [restaurantId],
  );

  /**
   * Socket event listeners
   */
  useEffect(() => {
    if (!socket) return;

    socketRef.current = socket;
    const deliveryRoom = `delivery-${restaurantId}`;

    // Join delivery room
    socket.emit("join-room", deliveryRoom);

    // Listen for new delivery orders
    socket.on("delivery:order-received", (data) => {
      if (data.restaurantId === restaurantId) {
        setDeliveryOrders((prev) => [data.deliveryOrder, ...prev]);
        toast.success("New delivery order received!");
      }
    });

    // Listen for order status updates
    socket.on("delivery:status-updated", (data) => {
      if (data.restaurantId === restaurantId || !data.restaurantId) {
        setDeliveryOrders((orders) =>
          orders.map((order) =>
            order._id === data.deliveryOrder._id ? data.deliveryOrder : order,
          ),
        );

        if (selectedOrder?._id === data.deliveryOrder._id) {
          setSelectedOrder(data.deliveryOrder);
        }

        toast.info(`Order status: ${data.deliveryOrder.orderStatus}`);
      }
    });

    // Listen for partner assignment
    socket.on("delivery:partner-assigned", (data) => {
      if (data.restaurantId === restaurantId) {
        setDeliveryOrders((orders) =>
          orders.map((order) =>
            order._id === data.deliveryOrder._id ? data.deliveryOrder : order,
          ),
        );

        toast.success(
          `Partner assigned: ${data.deliveryOrder.deliveryPartner.name}`,
        );
      }
    });

    // Listen for real-time location updates
    socket.on("delivery:location-updated", (data) => {
      setPartnerOrders((orders) =>
        orders.map((order) =>
          order.orderId === data.orderId
            ? {
                ...order,
                "deliveryPartner.location": data.location,
              }
            : order,
        ),
      );
    });

    // Listen for delivery completion
    socket.on("delivery:delivered", (data) => {
      if (data.restaurantId === restaurantId) {
        setDeliveryOrders((orders) =>
          orders.map((order) =>
            order._id === data.deliveryOrder._id ? data.deliveryOrder : order,
          ),
        );

        toast.success("Order delivered successfully!");
      }
    });

    // Listen for order cancellation
    socket.on("delivery:cancelled", (data) => {
      if (data.restaurantId === restaurantId) {
        setDeliveryOrders((orders) =>
          orders.filter((order) => order._id !== data.deliveryOrder._id),
        );

        toast.info("Order has been cancelled");
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave-room", deliveryRoom);
      socket.off("delivery:order-received");
      socket.off("delivery:status-updated");
      socket.off("delivery:partner-assigned");
      socket.off("delivery:location-updated");
      socket.off("delivery:delivered");
      socket.off("delivery:cancelled");
    };
  }, [socket, restaurantId, selectedOrder]);

  return {
    // State
    deliveryOrders,
    selectedOrder,
    partnerOrders,
    summary,
    loading,
    error,
    filters,

    // Methods
    loadDeliveryOrders,
    getDeliveryOrderDetail,
    updateOrderStatus,
    assignDeliveryPartner,
    getPartnerOrders,
    updatePartnerLocation,
    completeDelivery,
    cancelOrder,
    loadSummary,
    setFilters,
  };
};

export default useDeliveryOrders;
