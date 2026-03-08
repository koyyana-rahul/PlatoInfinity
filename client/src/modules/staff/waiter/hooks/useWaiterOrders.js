// src/modules/staff/waiter/hooks/useWaiterOrders.js
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../../../../socket/SocketProvider";
import axios from "../../../../api/axios";
import waiterApi from "../../../../api/waiter.api";
import toast from "react-hot-toast";

export function useWaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [readyItems, setReadyItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  // LOAD ORDERS FROM API
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios(waiterApi.getOrders);
      if (res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD READY ITEMS
  const loadReadyItems = useCallback(async () => {
    try {
      const res = await axios(waiterApi.getReadyItems);
      if (res.data.success) {
        setReadyItems(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load ready items:", err);
    }
  }, []);

  // SERVE ITEM
  const serveItem = useCallback(
    async (orderId, itemId) => {
      try {
        const res = await axios(waiterApi.serveItem(orderId, itemId));
        if (res.data.success) {
          toast.success("Item served!");
          // Reload orders
          loadOrders();
          loadReadyItems();
          return res.data.data;
        }
      } catch (err) {
        console.error("Failed to serve item:", err);
        toast.error(err.response?.data?.message || "Failed to serve item");
        throw err;
      }
    },
    [loadOrders, loadReadyItems],
  );

  // LOAD ON MOUNT
  useEffect(() => {
    loadOrders();
    loadReadyItems();
  }, [loadOrders, loadReadyItems]);

  // REAL-TIME SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    // New order placed - reload orders to get complete data
    const handleNewOrder = (data) => {
      console.log("📦 New order received:", data);
      toast.success(
        `New order at Table ${data.tableName}: ${data.itemCount} items`,
        { duration: 4000 },
      );
      // Reload orders from API to get full order details
      loadOrders();
    };

    // Table order placed event (alternative event name)
    const handleTableOrderPlaced = (data) => {
      console.log("🍽️ Table order placed:", data);
      toast.success(
        `New order at Table ${data.tableName}: ${data.itemCount || 0} items`,
        { duration: 4000 },
      );
      // Reload orders from API to get full order details
      loadOrders();
    };

    // Item ready for serving
    const handleItemReady = ({ orderId, itemId, itemName, tableName }) => {
      console.log("✅ Item ready:", { orderId, itemId, itemName });
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order;
          return {
            ...order,
            items: order.items.map((item) => {
              if (item._id !== itemId) return item;
              return { ...item, itemStatus: "READY" };
            }),
          };
        }),
      );
      loadReadyItems();
      toast.success(
        `${itemName || "Item"} ready at Table ${tableName || ""}!`,
        {
          duration: 4000,
        },
      );
    };

    // Item status changed
    const handleItemStatusChanged = (data) => {
      console.log("🔄 Item status changed:", data);
      const { orderId, itemId, itemIndex, itemStatus } = data;

      setOrders((prev) =>
        prev.map((order) => {
          if (String(order._id) !== String(orderId)) return order;
          return {
            ...order,
            items: order.items.map((item, idx) => {
              const matches =
                String(item._id) === String(itemId) || idx === itemIndex;
              if (!matches) return item;
              return { ...item, itemStatus };
            }),
          };
        }),
      );

      // Reload ready items if status changed to READY
      if (itemStatus === "READY") {
        loadReadyItems();
      }
    };

    // Customer needs attention
    const handleTableAlert = ({ tableId, tableName, reason }) => {
      toast.error(`Table ${tableName} needs attention: ${reason}`);
    };

    socket.on("order:placed", handleNewOrder);
    socket.on("table:order-placed", handleTableOrderPlaced);
    socket.on("waiter:item-ready-alert", handleItemReady);
    socket.on("table:item-status-changed", handleItemStatusChanged);
    socket.on("table:alert", handleTableAlert);

    return () => {
      socket.off("order:placed", handleNewOrder);
      socket.off("table:order-placed", handleTableOrderPlaced);
      socket.off("waiter:item-ready-alert", handleItemReady);
      socket.off("table:item-status-changed", handleItemStatusChanged);
      socket.off("table:alert", handleTableAlert);
    };
  }, [socket, loadOrders, loadReadyItems]);

  return {
    orders,
    readyItems,
    loading,
    serveItem,
    loadOrders,
    loadReadyItems,
  };
}
