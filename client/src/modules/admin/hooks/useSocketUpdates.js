import { useEffect } from "react";

/**
 * Custom hook for real-time socket updates to dashboard
 * Listens for order and table status changes
 */
export const useSocketUpdates = (
  socket,
  setStats,
  addRecentOrder,
  refetchOrders,
) => {
  useEffect(() => {
    if (!socket) return;

    const getTotalQuantity = (items = []) =>
      (Array.isArray(items) ? items : []).reduce(
        (sum, item) => sum + Number(item?.quantity || 0),
        0,
      );

    const handleOrderPlaced = (data) => {
      if (addRecentOrder) addRecentOrder(data);

      setStats((prev) => ({
        ...prev,
        ordersToday: (prev.ordersToday || 0) + 1,
        totalQuantity:
          (prev.totalQuantity || 0) + getTotalQuantity(data?.items),
        totalSales: (prev.totalSales || 0) + (data?.totalAmount || 0),
      }));
    };

    const handleOrderLifecycleUpdate = (data) => {
      if (!data?._id && !data?.orderId) {
        refetchOrders?.({ silent: true });
        return;
      }

      if (addRecentOrder) addRecentOrder(data);

      // Fallback resync when payload is sparse and may not include full order data
      const hasItemPatch = data?.itemId || data?.itemIndex !== undefined;
      const hasOrderItems = Array.isArray(data?.items) && data.items.length > 0;
      if (!hasItemPatch && !hasOrderItems) {
        refetchOrders?.({ silent: true });
      }
    };

    const handleSocketReconnect = () => {
      refetchOrders?.({ silent: true });
    };

    const handleTableStatus = (data) => {
      if (data.status === "OCCUPIED") {
        setStats((prev) => ({
          ...prev,
          activeTables: (prev.activeTables || 0) + 1,
        }));
      } else if (data.status === "AVAILABLE") {
        setStats((prev) => ({
          ...prev,
          activeTables: Math.max(0, (prev.activeTables || 0) - 1),
        }));
      }
    };

    socket.on("order:placed", handleOrderPlaced);
    socket.on("order:item-status-updated", handleOrderLifecycleUpdate);
    socket.on("order:status-changed", handleOrderLifecycleUpdate);
    socket.on("manager:order-status-changed", handleOrderLifecycleUpdate);
    socket.on("order:ready-for-serving", handleOrderLifecycleUpdate);
    socket.on("order:ready", handleOrderLifecycleUpdate);
    socket.on("order:served", handleOrderLifecycleUpdate);
    socket.on("order:cancelled", handleOrderLifecycleUpdate);
    socket.on("table:item-status-changed", handleOrderLifecycleUpdate);
    socket.on("waiter:item-ready-alert", handleOrderLifecycleUpdate);
    socket.on("table:status-changed", handleTableStatus);
    socket.on("table:status-updated", handleTableStatus);
    socket.on("connect", handleSocketReconnect);

    return () => {
      socket.off("order:placed", handleOrderPlaced);
      socket.off("order:item-status-updated", handleOrderLifecycleUpdate);
      socket.off("order:status-changed", handleOrderLifecycleUpdate);
      socket.off("manager:order-status-changed", handleOrderLifecycleUpdate);
      socket.off("order:ready-for-serving", handleOrderLifecycleUpdate);
      socket.off("order:ready", handleOrderLifecycleUpdate);
      socket.off("order:served", handleOrderLifecycleUpdate);
      socket.off("order:cancelled", handleOrderLifecycleUpdate);
      socket.off("table:item-status-changed", handleOrderLifecycleUpdate);
      socket.off("waiter:item-ready-alert", handleOrderLifecycleUpdate);
      socket.off("table:status-changed", handleTableStatus);
      socket.off("table:status-updated", handleTableStatus);
      socket.off("connect", handleSocketReconnect);
    };
  }, [socket, setStats, addRecentOrder, refetchOrders]);
};
