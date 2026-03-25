import { useEffect, useState } from "react";
import { FiClock, FiFilter, FiBell } from "react-icons/fi";
import { useSocket } from "../../../socket/SocketProvider";
import { useSelector } from "react-redux";
import Axios from "../../../api/axios";
import orderApi from "../../../api/order.api";
import OrderCard from "../../../components/waiter/OrderCard";
import toast from "react-hot-toast";

export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [readyAlerts, setReadyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();
  const restaurantId = useSelector((s) => s.user?.restaurantId);

  const updateOrderItemFromSocket = (data) => {
    const { orderId, _id, itemId, itemIndex, itemStatus, status, orderStatus } =
      data || {};

    const resolvedOrderId = orderId || _id;
    const resolvedItemStatus = itemStatus || status;

    if (!resolvedOrderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (String(order._id) !== String(resolvedOrderId)) return order;

        const nextItems = (order.items || []).map((item, idx) => {
          const matches =
            (itemId && String(item._id) === String(itemId)) ||
            (itemIndex !== undefined &&
              itemIndex !== null &&
              idx === itemIndex);

          if (!matches) return item;
          return {
            ...item,
            itemStatus: resolvedItemStatus || item.itemStatus,
          };
        });

        return {
          ...order,
          orderStatus: orderStatus || status || order.orderStatus,
          items: nextItems,
        };
      }),
    );
  };

  const load = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const res = await Axios(orderApi.listActiveOrders());
      setOrders(res.data.data || []);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const joinRooms = () => {
      socket.emit("join:restaurant", { restaurantId });
    };

    joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
    };
  }, [socket, restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      console.log("📦 New order received:", data);
      toast.success(
        `New order at Table ${data.tableName}: ${data.itemCount || 0} items`,
        { duration: 4000 },
      );
      // Auto-sync full order data for waiter UI
      load(true);
    };

    const handleTableOrderPlaced = (data) => {
      console.log("🍽️ Table order placed:", data);
      // Auto-sync full order data for waiter UI
      load(true);
    };

    const handleItemStatusChanged = (data) => {
      console.log("📶 WaiterOrders: item status changed", data);

      if (!data?.orderId && !data?._id) {
        load(true);
        return;
      }

      updateOrderItemFromSocket(data);
    };

    const handleOrderLifecycle = (data) => {
      // Sparse payloads are common for order-level events; refetch for consistency.
      if (!data?._id && !data?.orderId) {
        load(true);
        return;
      }

      if (!data?.itemId && data?.status && !data?.items) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            String(order._id) === String(data._id || data.orderId)
              ? { ...order, orderStatus: data.orderStatus || data.status }
              : order,
          ),
        );
      } else {
        updateOrderItemFromSocket(data);
      }

      load(true);
    };

    const handleConnect = () => {
      // Re-sync after reconnect to avoid missing events during downtime
      load(true);
    };

    // Listen for READY alerts from kitchen
    const handleItemReadyAlert = (alert) => {
      console.log("🔔 WAITER ALERT - item ready:", alert);
      toast(`${alert.itemName} is ready for Table ${alert.tableName}`, {
        icon: "🔔",
        duration: 6000,
      });
      // Optionally show in a dedicated alerts list
      setReadyAlerts((prev) => [alert, ...prev.slice(0, 9)]);
    };

    // Real-time item status updates (e.g., when another waiter serves an item)
    socket.on("order:item-status-updated", handleItemStatusChanged);
    socket.on("order:item-status", handleItemStatusChanged);
    socket.on("order:placed", handleNewOrder);
    socket.on("table:order-placed", handleTableOrderPlaced);
    socket.on("order:itemStatus", handleItemStatusChanged);
    socket.on("table:item-status-changed", handleItemStatusChanged);
    socket.on("order:status-changed", handleOrderLifecycle);
    socket.on("manager:order-status-changed", handleOrderLifecycle);
    socket.on("order:ready", handleOrderLifecycle);
    socket.on("order:served", handleOrderLifecycle);
    socket.on("order:cancelled", handleOrderLifecycle);
    socket.on("waiter:item-ready-alert", handleItemReadyAlert);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("order:item-status-updated", handleItemStatusChanged);
      socket.off("order:item-status", handleItemStatusChanged);
      socket.off("order:placed", handleNewOrder);
      socket.off("table:order-placed", handleTableOrderPlaced);
      socket.off("order:itemStatus", handleItemStatusChanged);
      socket.off("table:item-status-changed", handleItemStatusChanged);
      socket.off("order:status-changed", handleOrderLifecycle);
      socket.off("manager:order-status-changed", handleOrderLifecycle);
      socket.off("order:ready", handleOrderLifecycle);
      socket.off("order:served", handleOrderLifecycle);
      socket.off("order:cancelled", handleOrderLifecycle);
      socket.off("waiter:item-ready-alert", handleItemReadyAlert);
      socket.off("connect", handleConnect);
    };
  }, [socket]);

  // Helper to compute order-level status from items (same as OrderCard)
  const getOrderLevelStatus = (order) => {
    if (!order.items || order.items.length === 0) return "PLACED";
    const statuses = order.items.map((it) =>
      String(it.itemStatus || "NEW").toUpperCase(),
    );
    if (statuses.some((s) => s === "SERVING")) return "SERVING";
    if (statuses.some((s) => s === "SERVED")) return "SERVED";
    if (statuses.some((s) => s === "READY")) return "READY";
    if (statuses.some((s) => s === "IN_PROGRESS")) return "PREPARING";
    return "PLACED";
  };

  const visibleOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => getOrderLevelStatus(o) === statusFilter);

  const sortedOrders = [...visibleOrders].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
        <div className="bg-white border border-slate-200 rounded-3xl px-3 py-2.5 sm:px-5 sm:py-4 shadow-sm">
          {loading ? (
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-28 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-6 w-40 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-3 w-56 bg-slate-100 rounded-full animate-pulse" />
              </div>
              <div className="h-5 w-5 bg-slate-100 rounded-full animate-pulse" />
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5 mb-1">
                  <FiClock size={12} /> Waiter Orders
                </div>
                <h1 className="text-[15px] sm:text-xl font-black text-slate-900">
                  Live Orders
                </h1>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Monitor incoming table orders and item status in real time.
                </p>
              </div>
              {readyAlerts.length > 0 && (
                <div className="relative">
                  <FiBell className="text-orange-500 animate-pulse" size={20} />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {readyAlerts.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ready Alerts Banner */}
        {!loading && readyAlerts.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                <FiBell /> Ready for pickup
              </h2>
              <button
                onClick={() => setReadyAlerts([])}
                className="text-xs text-orange-600 hover:text-orange-800"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {readyAlerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="text-xs text-orange-800">
                  {alert.itemName} – Table {alert.tableName}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`kpi-shimmer-${idx}`}
                className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white"
              >
                <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-6 w-12 bg-slate-100 rounded-xl mt-3 animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <Kpi title="Total" value={orders.length} />
              <Kpi
                title="Placed"
                value={
                  orders.filter((o) => getOrderLevelStatus(o) === "PLACED")
                    .length
                }
                tone="neutral"
              />
              <Kpi
                title="Preparing"
                value={
                  orders.filter((o) => getOrderLevelStatus(o) === "PREPARING")
                    .length
                }
                tone="orange"
              />
              <Kpi
                title="Serving"
                value={
                  orders.filter((o) => getOrderLevelStatus(o) === "SERVING")
                    .length
                }
                tone="blue"
              />
              <Kpi
                title="Ready"
                value={
                  orders.filter((o) => getOrderLevelStatus(o) === "READY")
                    .length
                }
                tone="green"
              />
              <Kpi
                title="Served"
                value={
                  orders.filter((o) => getOrderLevelStatus(o) === "SERVED")
                    .length
                }
                tone="green"
              />
            </>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between shadow-sm">
          {loading ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="h-4 w-20 bg-slate-100 rounded-full animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`filter-shimmer-${idx}`}
                    className="h-9 w-16 bg-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <FiFilter size={14} />
                Filter
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "All", value: "ALL" },
                  { label: "Placed", value: "PLACED" },
                  { label: "Preparing", value: "PREPARING" },
                  { label: "Serving", value: "SERVING" },
                  { label: "Ready", value: "READY" },
                  { label: "Served", value: "SERVED" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`h-10 px-3 rounded-2xl text-xs font-semibold border transition-colors ${
                      statusFilter === f.value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`order-shimmer-${idx}`}
                className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-slate-600 shadow-sm">
            No matching orders
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ title, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : tone === "blue"
        ? "bg-blue-50 border-blue-200 text-blue-700"
        : tone === "green"
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5">
        <FiClock size={12} /> {title}
      </p>
      <p className="text-2xl font-black mt-1.5 text-slate-900">{value}</p>
    </div>
  );
}
