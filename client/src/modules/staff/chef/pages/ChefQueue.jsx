// src/modules/staff/chef/pages/ChefQueue.jsx
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import useKitchenOrders from "../hooks/useKitchenOrders";
import KitchenOrderCard from "../components/KitchenOrderCard";
import { FiRefreshCcw } from "react-icons/fi";

export default function ChefQueue() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const kitchenStationId = useSelector((s) => s.user.kitchenStationId || null);
  const [refreshing, setRefreshing] = useState(false);

  const { orders, loading, reload, updateOrderItemStatus } = useKitchenOrders(
    station,
    kitchenStationId,
  );

  // 🧠 Queue = orders where ALL items are still NEW
  const queuedOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.items.every((i) => i.itemStatus === "NEW"),
      ),
    [orders],
  );

  const itemCount = useMemo(
    () =>
      queuedOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0),
    [queuedOrders],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading queue…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Queue</h1>
            <p className="text-sm text-gray-600 mt-1">
              New incoming tickets waiting to start
            </p>
          </div>
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            🔔 Incoming
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Kpi
          label="Orders in Queue"
          value={queuedOrders.length}
          tone="orange"
        />
        <Kpi label="Total Items" value={itemCount} tone="blue" />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 px-4 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-semibold text-sm hover:shadow-sm disabled:opacity-60 inline-flex items-center gap-2"
        >
          <FiRefreshCcw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {queuedOrders.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-lg">No orders in queue 🎉</p>
            <p className="text-gray-400 text-sm mt-1">
              Ready for incoming orders
            </p>
          </div>
        ) : (
          queuedOrders.map((order) => (
            <KitchenOrderCard
              key={order._id}
              order={order}
              reload={reload}
              onStatusUpdate={updateOrderItemStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : tone === "green"
        ? "bg-green-50 border-green-200 text-green-700"
        : tone === "blue"
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
