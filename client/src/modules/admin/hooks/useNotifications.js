import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to manage notifications
 * Handles real-time notifications with auto-dismiss
 */
export const useNotifications = (socket) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-dismiss after 5 seconds if no explicit duration
    if (notification.autoDismiss !== false) {
      setTimeout(() => {
        dismissNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      addNotification({
        type: "success",
        title: `New Order #${order.orderNumber}`,
        message: `${order.items?.length || 0} items • ₹${order.totalAmount}`,
        autoDismiss: true,
      });
    };

    const handleOrderStatusChange = (order) => {
      addNotification({
        type: "info",
        title: `Order #${order.orderNumber} Updated`,
        message: `Status: ${order.orderStatus}`,
        autoDismiss: true,
      });
    };

    const handleOrderDelay = (order) => {
      addNotification({
        type: "warning",
        title: `Order #${order.orderNumber} Running Late`,
        message: "Prepared for more than 15 minutes",
        autoDismiss: false,
      });
    };

    socket.on("order:placed", handleNewOrder);
    socket.on("order:status-changed", handleOrderStatusChange);
    socket.on("order:delay-alert", handleOrderDelay);

    return () => {
      socket.off("order:placed", handleNewOrder);
      socket.off("order:status-changed", handleOrderStatusChange);
      socket.off("order:delay-alert", handleOrderDelay);
    };
  }, [socket, addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
  };
};
