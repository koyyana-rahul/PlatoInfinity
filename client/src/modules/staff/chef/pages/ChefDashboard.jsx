// src/modules/staff/chef/pages/ChefDashboard.jsx
import { useSelector } from "react-redux";
import useKitchenOrders from "../hooks/useKitchenOrders";
import KitchenOrderCard from "../components/KitchenOrderCard";

export default function ChefDashboard() {
  const station = useSelector((s) => s.user.station || "MAIN");

  const { orders, loading, reload } = useKitchenOrders(station);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-gray-400">
        No active orders for this station
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {orders.map((order) => (
        <KitchenOrderCard
          key={order._id}
          order={order}
          reload={reload}
        />
      ))}
    </div>
  );
}