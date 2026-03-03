// src/modules/staff/chef/pages/ChefDashboard.jsx
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import useKitchenOrders from "../hooks/useKitchenOrders";
import KitchenOrderCard from "../components/KitchenOrderCard";
import { FiSearch, FiFilter, FiRefreshCcw } from "react-icons/fi";

export default function ChefDashboard() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | NEW | IN_PROGRESS | READY
  const [refreshing, setRefreshing] = useState(false);

  const { orders, loading, reload, updateOrderItemStatus } =
    useKitchenOrders(station);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kitchen Console
            </h1>
            <p className="text-sm text-gray-600 mt-1">Station: {station}</p>
          </div>
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            ⚡ Live
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total Orders" value={orders.length} />
        <Kpi label="Pending" value={pendingCount} tone="orange" />
        <Kpi label="Cooking" value={cookingCount} tone="green" />
        <Kpi label="Ready" value={readyCount} tone="blue" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
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
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 flex items-center gap-2"
        >
          <option value="ALL">All Items</option>
          <option value="NEW">Pending</option>
          <option value="IN_PROGRESS">Cooking</option>
          <option value="READY">Ready</option>
        </select>
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
