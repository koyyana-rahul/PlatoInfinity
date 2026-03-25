// src/modules/staff/chef/pages/ChefQueue.jsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import useKitchenOrders from "../hooks/useKitchenOrders";
import KitchenOrderCard from "../components/KitchenOrderCard";

export default function ChefQueue() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const kitchenStationId = useSelector((s) => s.user.kitchenStationId || null);

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

  if (loading) {
    return <ChefQueueSkeleton />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Queue</h1>
            <p className="text-sm text-gray-600 mt-1">
              New incoming tickets waiting to start
            </p>
          </div>
          <div className="w-fit bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            🔔 Incoming
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Kpi
          label="Orders in Queue"
          value={queuedOrders.length}
          tone="orange"
        />
        <Kpi label="Total Items" value={itemCount} tone="blue" />
      </div>

      <div className="space-y-4">
        {queuedOrders.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-white border border-gray-200 rounded-2xl">
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

function ChefQueueSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-56 bg-gray-100 rounded mt-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-2"
          >
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded" />
            </div>
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
