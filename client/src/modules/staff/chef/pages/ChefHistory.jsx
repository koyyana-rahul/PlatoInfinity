// src/modules/staff/chef/pages/ChefHistory.jsx
import { useEffect, useState, useMemo } from "react";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import { useSelector } from "react-redux";
import { FiRefreshCcw } from "react-icons/fi";
import { useSocket } from "../../../../socket/SocketProvider";
import toast from "react-hot-toast";

export default function ChefHistory() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await Axios({
        ...chefApi.listOrders,
        params: { station },
      });

      // 🧠 History = orders where all items are served
      const completed = (res.data.data || []).filter((o) =>
        (o.items || []).every((i) => i.itemStatus === "SERVED"),
      );

      setOrders(
        completed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [station]);

  // 🔥 REAL-TIME SOCKET LISTENER - Auto-refresh when items are marked SERVED
  useEffect(() => {
    if (!socket) return;

    const handleItemStatusUpdate = (data) => {
      console.log("📡 Item status update in history:", data);

      // If an item is marked as SERVED, refresh history silently
      if (data.itemStatus === "SERVED") {
        loadHistory(true);
      }
    };

    socket.on("order:item-status-updated", handleItemStatusUpdate);

    return () => {
      socket.off("order:item-status-updated", handleItemStatusUpdate);
    };
  }, [socket, station]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory(true);
    setRefreshing(false);
    toast.success("History refreshed");
  };

  const itemCount = useMemo(
    () => orders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
    [orders],
  );

  if (loading) {
    return <div className="p-6 text-gray-500">Loading history…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">History</h1>
            <p className="text-sm text-gray-600 mt-1">
              Completed orders for station {station}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            ✓ Served
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Kpi label="Orders Served" value={orders.length} tone="green" />
        <Kpi label="Total Items Served" value={itemCount} tone="blue" />
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

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-lg">No completed orders yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Orders will appear here once served
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="p-4 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Table {order.tableName || order.tableId}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded border border-green-200 uppercase tracking-wide">
                      Served
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">
                  {new Date(order.updatedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                {order.items.map((i) => (
                  <div
                    key={i._id}
                    className="flex justify-between text-sm text-gray-600"
                  >
                    <span>{i.name}</span>
                    <span className="font-semibold text-gray-900">
                      ×{i.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
