import { useEffect } from "react";

/**
 * Custom hook for real-time socket updates to dashboard
 * Listens for order and table status changes
 */
export const useSocketUpdates = (socket, setStats, addRecentOrder) => {
  useEffect(() => {
    if (!socket) return;

    const handleOrderPlaced = (data) => {
      // Add to recent orders
      if (addRecentOrder) {
        addRecentOrder(data);
      }

      // Update stats
      setStats((prev) => ({
        ...prev,
        ordersToday: prev.ordersToday + 1,
        totalSales: prev.totalSales + (data.totalAmount || 0),
      }));
    };

    const handleTableStatus = (data) => {
      if (data.status === "OCCUPIED") {
        setStats((prev) => ({
          ...prev,
          activeTables: prev.activeTables + 1,
        }));
      } else if (data.status === "AVAILABLE") {
        setStats((prev) => ({
          ...prev,
          activeTables: Math.max(0, prev.activeTables - 1),
        }));
      }
    };

    socket.on("order:placed", handleOrderPlaced);
    socket.on("table:status-changed", handleTableStatus);

    return () => {
      socket.off("order:placed", handleOrderPlaced);
      socket.off("table:status-changed", handleTableStatus);
    };
  }, [socket, setStats, addRecentOrder]);
};
