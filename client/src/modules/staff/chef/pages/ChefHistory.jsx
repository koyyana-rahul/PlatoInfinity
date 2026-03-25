// src/modules/staff/chef/pages/ChefHistory.jsx
import { useEffect, useState, useMemo } from "react";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import { useSelector } from "react-redux";
import { useSocket } from "../../../../socket/SocketProvider";

const formatTableNo = (tableName, tableId) => {
  const raw = String(tableName || tableId || "Unknown").trim();
  return raw.replace(/^table\s*/i, "").trim();
};

export default function ChefHistory() {
  const station = useSelector((s) => s.user.station || "MAIN");
  const kitchenStationId = useSelector((s) => s.user.kitchenStationId || null);
  const restaurantId = useSelector((s) => s.user?.restaurantId);
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await Axios({
        ...chefApi.listOrders,
        params: {
          ...(station ? { station } : {}),
          ...(kitchenStationId ? { stationId: kitchenStationId } : {}),
          includeServed: true,
        },
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
  }, [station, kitchenStationId]);

  // 🔥 REAL-TIME SOCKET LISTENER - Auto-refresh when items are marked SERVED
  useEffect(() => {
    if (!socket || !restaurantId) return;

    const joinRooms = () => {
      socket.emit("join:restaurant", { restaurantId });
      socket.emit("join:kitchen", { restaurantId });
    };

    joinRooms();
    socket.on("connect", joinRooms);

    const handleItemStatusUpdate = (data) => {
      if (data.itemStatus === "SERVED" || data.status === "SERVED") {
        loadHistory(true);
        return;
      }

      if (data.itemStatus === "READY" || data.status === "READY") {
        loadHistory(true);
      }
    };

    const handleLifecycleRefresh = () => {
      loadHistory(true);
    };

    socket.on("order:item-status-updated", handleItemStatusUpdate);
    socket.on("order:itemStatus", handleItemStatusUpdate);
    socket.on("order:served", handleLifecycleRefresh);
    socket.on("order:ready", handleLifecycleRefresh);
    socket.on("order:status-changed", handleLifecycleRefresh);
    socket.on("manager:order-status-changed", handleLifecycleRefresh);
    socket.on("connect", handleLifecycleRefresh);

    return () => {
      socket.off("connect", joinRooms);
      socket.off("order:item-status-updated", handleItemStatusUpdate);
      socket.off("order:itemStatus", handleItemStatusUpdate);
      socket.off("order:served", handleLifecycleRefresh);
      socket.off("order:ready", handleLifecycleRefresh);
      socket.off("order:status-changed", handleLifecycleRefresh);
      socket.off("manager:order-status-changed", handleLifecycleRefresh);
      socket.off("connect", handleLifecycleRefresh);
    };
  }, [socket, restaurantId, station, kitchenStationId]);

  const itemCount = useMemo(
    () => orders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
    [orders],
  );

  if (loading) {
    return <ChefHistorySkeleton />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">History</h1>
            <p className="text-sm text-gray-600 mt-1">
              Completed orders for station {station}
            </p>
          </div>
          <div className="w-fit bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            ✓ Served
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Orders Served" value={orders.length} tone="green" />
        <Kpi label="Total Items Served" value={itemCount} tone="blue" />
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="text-gray-500 text-lg">No completed orders yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Orders will appear here once served
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="p-3.5 sm:p-4 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Table {formatTableNo(order.tableName, order.tableId)}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded border border-green-200 uppercase tracking-wide">
                      Served
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap sm:ml-2">
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

function ChefHistorySkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-pulse">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-60 bg-gray-100 rounded mt-2" />
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

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 border border-gray-200 rounded-xl bg-white space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-100 rounded w-11/12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
