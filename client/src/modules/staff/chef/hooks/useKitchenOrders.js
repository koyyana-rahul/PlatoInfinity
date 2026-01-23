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

    const handleNewOrder = (newOrder) => {
      const hasItemForStation = newOrder.items.some(
        (item) => item.station === station
      );
      if (hasItemForStation) {
        setOrders((prevOrders) => {
          // Avoid duplicates
          if (prevOrders.some((o) => o._id === newOrder._id)) {
            return prevOrders;
          }
          return [newOrder, ...prevOrders];
        });
      }
    };

    const handleStatusUpdate = (update) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id !== update.orderId) return order;
          const newItems = order.items.map((item) => {
            if (item._id !== update.itemId) return item;
            return { ...item, itemStatus: update.status };
          });
          return {
            ...order,
            items: newItems,
          };
        })
      );
    };

    socket.on("order:placed", handleNewOrder);
    socket.on("order:itemStatus", handleStatusUpdate);

    return () => {
      socket.off("order:placed", handleNewOrder);
      socket.off("order:itemStatus", handleStatusUpdate);
    };
  }, [socket, station]);

  return { orders, loading, reload: loadOrders };
}