// src/modules/staff/chef/hooks/useKitchenOrders.js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../../../socket/SocketProvider";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import toast from "react-hot-toast";

export default function useKitchenOrders(station, stationId = null) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const restaurantId = useSelector((s) => s.user?.restaurantId);

  const applyStatusUpdate = (orderId, itemId, status, itemIndex = null) => {
    if (!orderId || !status) return;
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (String(order._id) !== String(orderId)) return order;
        const newItems = (order.items || []).map((item, idx) => {
          const matchById = itemId && String(item._id) === String(itemId);
          const matchByIndex =
            itemIndex !== null && itemIndex !== undefined && idx === itemIndex;
          if (!matchById && !matchByIndex) return item;
          return { ...item, itemStatus: status };
        });
        return {
          ...order,
          items: newItems,
        };
      }),
    );
  };

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const res = await Axios({
        ...chefApi.listOrders,
        params: {
          ...(station ? { station } : {}),
          ...(stationId ? { stationId } : {}),
        },
      });
      setOrders(res.data.data || []);
    } catch {
      toast.error("Failed to load kitchen orders");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (station || stationId) loadOrders();
  }, [station, stationId]);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const joinRooms = () => {
      socket.emit("join:restaurant", { restaurantId });
      socket.emit("join:kitchen", { restaurantId });
    };

    joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
    };
  }, [socket, restaurantId]);

  useEffect(() => {
    if (!socket || (!station && !stationId)) return;

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

      const hasItemForStation = orderPayload.items.some((item) => {
        const matchesStationId =
          stationId &&
          item?.kitchenStationId &&
          String(item.kitchenStationId) === String(stationId);

        const matchesStationName =
          station && item?.station && String(item.station) === String(station);

        // If backend already scoped event by room and fields are absent/misaligned,
        // allow event through rather than dropping valid new orders.
        const noRoutingMetadata = !item?.kitchenStationId && !item?.station;

        return matchesStationId || matchesStationName || noRoutingMetadata;
      });
      if (hasItemForStation) {
        setOrders((prevOrders) => {
          if (
            prevOrders.some((o) => String(o._id) === String(orderPayload._id))
          ) {
            return prevOrders;
          }
          return [orderPayload, ...prevOrders];
        });
      }
    };

    const handleStatusUpdate = (update) => {
      const status = update.status || update.itemStatus;
      const itemId = update.itemId;
      const itemIndex = update.itemIndex;
      const orderId = update.orderId || update._id;

      if (!orderId) {
        loadOrders();
        return;
      }

      applyStatusUpdate(orderId, itemId, status, itemIndex);
    };

    const handleConnect = () => {
      loadOrders({ silent: true });
    };

    const handleLifecycleRefresh = () => {
      // Fallback path: even if station-room event is missed, chef still receives
      // restaurant-level lifecycle events and can sync instantly.
      loadOrders({ silent: true });
    };

    socket.on("kitchen:order-new", handleNewOrder);
    socket.on("order:item-status-updated", handleStatusUpdate);
    socket.on("order:itemStatus", handleStatusUpdate);
    socket.on("order:placed", handleLifecycleRefresh);
    socket.on("order:status-changed", handleLifecycleRefresh);
    socket.on("manager:order-status-changed", handleLifecycleRefresh);
    socket.on("order:ready", handleLifecycleRefresh);
    socket.on("order:served", handleLifecycleRefresh);
    socket.on("order:cancelled", handleLifecycleRefresh);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("kitchen:order-new", handleNewOrder);
      socket.off("order:item-status-updated", handleStatusUpdate);
      socket.off("order:itemStatus", handleStatusUpdate);
      socket.off("order:placed", handleLifecycleRefresh);
      socket.off("order:status-changed", handleLifecycleRefresh);
      socket.off("manager:order-status-changed", handleLifecycleRefresh);
      socket.off("order:ready", handleLifecycleRefresh);
      socket.off("order:served", handleLifecycleRefresh);
      socket.off("order:cancelled", handleLifecycleRefresh);
      socket.off("connect", handleConnect);
    };
  }, [socket, station, stationId]);

  return {
    orders,
    loading,
    reload: loadOrders,
    updateOrderItemStatus: applyStatusUpdate,
  };
}
