import { useEffect, useState } from "react";
import Axios from "../../../api/axios";
import orderApi from "../../../api/order.api";
import OrderCard from "../../../components/waiter/OrderCard";

export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const res = await Axios(orderApi.listActiveOrders());
    setOrders(res.data.data || []);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

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