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

  const normalizeStatus = (status) =>
    String(status || "").toUpperCase() || "NEW";

  const applyOrderLevelStatusToItems = (items = [], status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "SERVED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: "SERVED",
      }));
    }

    return Array.isArray(items) ? items : [];
  };

  const deriveOrderStatus = (currentStatus, items = [], incomingItemStatus) => {
    const normalizedCurrent = normalizeStatus(currentStatus);
    const normalizedItems = Array.isArray(items) ? items : [];
    const statuses = normalizedItems.map((it) =>
      String(it?.itemStatus || "").toUpperCase(),
    );
    const totalItems = statuses.length;
    const servedCount = statuses.filter((s) => s === "SERVED").length;
    const incoming = String(incomingItemStatus || "").toUpperCase();

    // Final statuses should always win over stale item arrays.
    if (["SERVED", "CANCELLED", "PAID"].includes(normalizedCurrent)) {
      return normalizedCurrent;
    }

    if (
      incoming === "SERVED" ||
      (totalItems > 0 && servedCount > 0 && servedCount === totalItems)
    ) {
      return "SERVED";
    }
    if (
      statuses.some((s) => s === "SERVING") ||
      incoming === "SERVING" ||
      servedCount > 0
    ) {
      return "SERVING";
    }
    if (statuses.some((s) => s === "READY") || incoming === "READY") {
      return "READY";
    }
    if (
      statuses.some((s) => s === "IN_PROGRESS") ||
      incoming === "IN_PROGRESS" ||
      normalizedCurrent === "IN_PROGRESS"
    ) {
      return "IN_PROGRESS";
    }

    if (
      ["READY", "SERVING", "IN_PROGRESS", "NEW"].includes(normalizedCurrent)
    ) {
      return normalizedCurrent;
    }

    return "NEW";
  };

  const normalizeOrder = (order = {}) => {
    const normalizedItems = Array.isArray(order.items) ? order.items : [];
    const initialStatus = String(order.orderStatus || order.status || "NEW");
    const derivedStatus = deriveOrderStatus(
      initialStatus,
      normalizedItems,
      order.itemStatus,
    );

    return {
      ...order,
      _id: order._id || order.orderId,
      orderStatus: derivedStatus,
      createdAt:
        order.createdAt ||
        order.placedAt ||
        order.updatedAt ||
        new Date().toISOString(),
      items: applyOrderLevelStatusToItems(normalizedItems, derivedStatus),
    };
  };

  const fetchOrders = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const response = await dashboardService.getRecentOrders(
        10,
        timeRange,
        restaurantId,
      );

      if (response?.data && Array.isArray(response.data)) {
        setRecentOrders(response.data.map((order) => normalizeOrder(order)));
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err.message);
      setError(
        err?.response?.data?.message || err.message || "Failed to fetch orders",
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [timeRange, restaurantId]);

  const upsertRecentOrder = (incoming = {}) => {
    const normalized = normalizeOrder(incoming);
    const incomingId = normalized._id;

    if (!incomingId) return;

    setRecentOrders((prev) => {
      const exists = prev.some((o) => String(o._id) === String(incomingId));

      const updated = exists
        ? prev.map((o) => {
            if (String(o._id) !== String(incomingId)) return o;

            const baseItems =
              Array.isArray(normalized.items) && normalized.items.length
                ? normalized.items
                : o.items || [];

            const nextItems = baseItems.map((item, idx) => {
              const byId =
                normalized.itemId &&
                String(item._id) === String(normalized.itemId);
              const byIndex =
                normalized.itemIndex !== undefined &&
                normalized.itemIndex !== null &&
                idx === normalized.itemIndex;

              if (!byId && !byIndex) return item;

              return {
                ...item,
                itemStatus:
                  normalized.itemStatus || normalized.status || item.itemStatus,
              };
            });

            const incomingOrderStatus =
              normalized.orderStatus || normalized.status || o.orderStatus;
            const patchedItems = applyOrderLevelStatusToItems(
              nextItems,
              incomingOrderStatus,
            );

            return {
              ...o,
              ...normalized,
              _id: o._id,
              orderStatus: deriveOrderStatus(
                incomingOrderStatus,
                patchedItems,
                normalized.itemStatus,
              ),
              items: patchedItems,
            };
          })
        : [normalized, ...prev];

      return updated
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.placedAt || 0) -
            new Date(a.createdAt || a.placedAt || 0),
        )
        .slice(0, 10);
    });
  };

  // Backward-compatible alias used by existing consumers
  const addRecentOrder = (order) => {
    upsertRecentOrder(order);
  };

  return {
    recentOrders,
    loading,
    error,
    setRecentOrders,
    addRecentOrder,
    upsertRecentOrder,
    refetch: fetchOrders,
  };
};
