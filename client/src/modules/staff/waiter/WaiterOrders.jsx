import { useEffect, useState } from "react";
import { useSocket } from "../../../socket/SocketProvider";
import Axios from "../../../api/axios";
import orderApi from "../../../api/order.api";
import OrderCard from "../../../components/waiter/OrderCard";

export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);

  const socket = useSocket();

  const load = async () => {
    const res = await Axios(orderApi.listActiveOrders());
    setOrders(res.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    };

    const handleStatusUpdate = (update) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id !== update.orderId) return order;
          return {
            ...order,
            items: order.items.map((item) => {
              if (item._id !== update.itemId) return item;
              return { ...item, itemStatus: update.status };
            }),
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
  }, [socket]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Live Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border text-gray-600">
          No active orders
        </div>
      ) : (
        orders.map((o) => <OrderCard key={o._id} order={o} />)
      )}
    </div>
  );
}