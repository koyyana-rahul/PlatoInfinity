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

    // New order placed
    const handleNewOrder = (order) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === order._id)) return prev;
        return [order, ...prev];
      });
    };

    // Item ready for serving
    const handleItemReady = ({ orderId, itemId }) => {
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
      toast("Item ready for pickup!");
    };

    // Customer needs attention
    const handleTableAlert = ({ tableId, tableName, reason }) => {
      toast.error(`Table ${tableName} needs attention: ${reason}`);
    };

    socket.on("order:placed", handleNewOrder);
    socket.on("waiter:item-ready-alert", handleItemReady);
    socket.on("table:alert", handleTableAlert);

    return () => {
      socket.off("order:placed", handleNewOrder);
      socket.off("waiter:item-ready-alert", handleItemReady);
      socket.off("table:alert", handleTableAlert);
    };
  }, [socket, loadReadyItems]);

  return {
    orders,
    readyItems,
    loading,
    serveItem,
    loadOrders,
    loadReadyItems,
  };
}
