// src/modules/staff/chef/pages/ChefQueue.jsx
import { useSelector } from "react-redux";
import useKitchenOrders from "../hooks/useKitchenOrders";
import KitchenOrderCard from "../components/KitchenOrderCard";

export default function ChefQueue() {
  const station = useSelector((s) => s.user.station || "MAIN");

  const { orders, loading, reload, updateOrderItemStatus } =
    useKitchenOrders(station);

  // 🧠 Queue = orders where ALL items are still NEW
  const queuedOrders = orders.filter((order) =>
    order.items.every((i) => i.itemStatus === "NEW"),
  );

  if (loading) {
    return <div className="p-6 text-gray-500">Loading queue…</div>;
  }

  if (!queuedOrders.length) {
    return <div className="p-6 text-gray-400">No orders in queue 🎉</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {queuedOrders.map((order) => (
        <KitchenOrderCard
          key={order._id}
          order={order}
          reload={reload}
          onStatusUpdate={updateOrderItemStatus}
        />
      ))}
    </div>
  );
}
