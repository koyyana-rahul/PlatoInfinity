// src/modules/staff/chef/pages/ChefDashboard.jsx
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import useKitchenOrders from "../hooks/useKitchenOrders";
import KitchenOrderCard from "../components/KitchenOrderCard";
import { FiSearch } from "react-icons/fi";

export default function ChefDashboard() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const kitchenStationId = useSelector((s) => s.user.kitchenStationId || null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | NEW | IN_PROGRESS | READY

  const { orders, loading, reload, updateOrderItemStatus } = useKitchenOrders(
    station,
    kitchenStationId,
  );

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        search === "" ||
        order.tableName?.toLowerCase().includes(search.toLowerCase()) ||
        order.tableId?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (filter === "NEW" &&
          order.items?.some((i) => i.itemStatus === "NEW")) ||
        (filter === "IN_PROGRESS" &&
          order.items?.some((i) => i.itemStatus === "IN_PROGRESS")) ||
        (filter === "READY" &&
          order.items?.some((i) => i.itemStatus === "READY"));

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const pendingCount = useMemo(
    () =>
      orders.filter((o) => o.items?.some((i) => i.itemStatus === "NEW")).length,
    [orders],
  );

  const cookingCount = useMemo(
    () =>
      orders.filter((o) => o.items?.some((i) => i.itemStatus === "IN_PROGRESS"))
        .length,
    [orders],
  );

  const readyCount = useMemo(
    () =>
      orders.filter((o) => o.items?.some((i) => i.itemStatus === "READY"))
        .length,
    [orders],
  );

  if (loading) {
    return <ChefDashboardSkeleton />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Kitchen Console
            </h1>
            <p className="text-sm text-gray-600 mt-1">Station: {station}</p>
          </div>
          <div className="w-fit bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            ⚡ Live
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total Orders" value={orders.length} />
        <Kpi label="Pending" value={pendingCount} tone="orange" />
        <Kpi label="Cooking" value={cookingCount} tone="green" />
        <Kpi label="Ready" value={readyCount} tone="blue" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500"
        >
          <option value="ALL">All Items</option>
          <option value="NEW">Pending</option>
          <option value="IN_PROGRESS">Cooking</option>
          <option value="READY">Ready</option>
        </select>
      </div>

      <div className="space-y-4">
        {visibleOrders.length === 0 ? (
          <div className="p-6 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-500">No orders match your filters</p>
          </div>
        ) : (
          visibleOrders.map((order) => (
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

function ChefDashboardSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-100 rounded mt-2" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-2"
          >
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-7 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-5 space-y-3 sm:space-y-0 sm:flex sm:gap-3">
        <div className="h-10 flex-1 bg-gray-100 rounded-lg" />
        <div className="h-10 w-full sm:w-36 bg-gray-100 rounded-lg" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-28 bg-gray-200 rounded" />
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
