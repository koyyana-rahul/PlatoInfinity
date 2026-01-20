// src/modules/staff/chef/pages/ChefHistory.jsx
import { useEffect, useState } from "react";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import { useSelector } from "react-redux";

export default function ChefHistory() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        ...chefApi.listOrders,
        params: { station },
      });

      // 🧠 History = orders where all items are served
      const completed = (res.data.data || []).filter((o) =>
        (o.items || []).every((i) => i.itemStatus === "SERVED")
      );

      setOrders(completed);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [station]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading history…</div>;
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-gray-400">
        No completed orders yet
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="p-4 border rounded-lg bg-white"
        >
          <div className="flex justify-between">
            <h3 className="font-semibold">
              Table {order.tableName || order.tableId}
            </h3>
            <span className="text-xs text-gray-500">
              {new Date(order.updatedAt).toLocaleTimeString()}
            </span>
          </div>

          <ul className="mt-2 text-sm text-gray-600 list-disc ml-5">
            {order.items.map((i) => (
              <li key={i._id}>
                {i.name} × {i.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}