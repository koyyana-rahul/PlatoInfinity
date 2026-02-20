// src/modules/staff/chef/hooks/useKitchenOrders.js
import { useEffect, useState } from "react";
import { useSocket } from "../../../../socket/SocketProvider";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import toast from "react-hot-toast";

export default function useKitchenOrders(station) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const applyStatusUpdate = (orderId, itemId, status) => {
    if (!orderId || !itemId || !status) return;
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order._id !== orderId) return order;
        const newItems = order.items.map((item) => {
          if (String(item._id) !== String(itemId)) return item;
          return { ...item, itemStatus: status };
        });
        return {
          ...order,
          items: newItems,
        };
      }),
    );
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        ...chefApi.listOrders,
        params: { station },
      });
      setOrders(res.data.data || []);
    } catch {
      toast.error("Failed to load kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (station) loadOrders();
  }, [station]);

  useEffect(() => {
    if (!socket || !station) return;

    const handleNewOrder = (payload) => {
      const orderPayload = payload.orderId
        ? {
            _id: payload.orderId,
            tableId: payload.tableId,
            tableName: payload.tableName,
            orderNumber: payload.orderNumber,
            createdAt: payload.placedAt || new Date().toISOString(),
            items: payload.items || [],
          }
        : payload;

      if (!orderPayload?.items?.length) return;

      const hasItemForStation = orderPayload.items.some(
        (item) => item.station === station,
      );
      if (hasItemForStation) {
        setOrders((prevOrders) => {
          if (prevOrders.some((o) => o._id === orderPayload._id)) {
            return prevOrders;
          }
          return [orderPayload, ...prevOrders];
        });
      }
    };

    const handleStatusUpdate = (update) => {
      const status = update.status || update.itemStatus;
      const itemId = update.itemId || update.itemIndex;
      const orderId = update.orderId;
      applyStatusUpdate(orderId, itemId, status);
    };

    socket.on("kitchen:order-new", handleNewOrder);
    socket.on("order:item-status-updated", handleStatusUpdate);
    socket.on("order:itemStatus", handleStatusUpdate);

    return () => {
      socket.off("kitchen:order-new", handleNewOrder);
      socket.off("order:item-status-updated", handleStatusUpdate);
      socket.off("order:itemStatus", handleStatusUpdate);
    };
  }, [socket, station]);

  return {
    orders,
    loading,
    reload: loadOrders,
    updateOrderItemStatus: applyStatusUpdate,
  };
}
