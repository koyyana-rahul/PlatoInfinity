import { useEffect, useState } from "react";
import { FiClock, FiFilter, FiRefreshCcw, FiBell } from "react-icons/fi";
import { useSocket } from "../../../socket/SocketProvider";
import Axios from "../../../api/axios";
import orderApi from "../../../api/order.api";
import OrderCard from "../../../components/waiter/OrderCard";
import toast from "react-hot-toast";

export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [readyAlerts, setReadyAlerts] = useState([]);

  const socket = useSocket();

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
      if (!silent) setRefreshing(true);
      const res = await Axios(orderApi.listActiveOrders());
      setOrders(res.data.data || []);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor incoming table orders and item status in real time.
            </p>
          </div>
          {readyAlerts.length > 0 && (
            <div className="relative">
              <FiBell className="text-orange-500 animate-pulse" size={20} />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {readyAlerts.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ready Alerts Banner */}
      {readyAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Kpi title="Total" value={orders.length} />
        <Kpi
          title="Placed"
          value={
            orders.filter((o) => getOrderLevelStatus(o) === "PLACED").length
          }
          tone="neutral"
        />
        <Kpi
          title="Preparing"
          value={
            orders.filter((o) => getOrderLevelStatus(o) === "PREPARING").length
          }
          tone="orange"
        />
        <Kpi
          title="Serving"
          value={
            orders.filter((o) => getOrderLevelStatus(o) === "SERVING").length
          }
          tone="blue"
        />
        <Kpi
          title="Ready"
          value={
            orders.filter((o) => getOrderLevelStatus(o) === "READY").length
          }
          tone="green"
        />
        <Kpi
          title="Served"
          value={
            orders.filter((o) => getOrderLevelStatus(o) === "SERVED").length
          }
          tone="green"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
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
              className={`h-10 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                statusFilter === f.value
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => load(true)}
            className="h-9 px-3 rounded-xl text-xs font-semibold border border-orange-200 bg-orange-50 text-orange-700 inline-flex items-center gap-1.5"
          >
            <FiRefreshCcw
              className={refreshing ? "animate-spin" : ""}
              size={12}
            />
            Refresh
          </button>
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-gray-600">
          No matching orders
        </div>
      ) : (
        visibleOrders.map((o) => <OrderCard key={o._id} order={o} />)
      )}
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
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide font-semibold inline-flex items-center gap-1.5">
        <FiClock size={12} /> {title}
      </p>
      <p className="text-2xl font-bold mt-1.5">{value}</p>
    </div>
  );
}
