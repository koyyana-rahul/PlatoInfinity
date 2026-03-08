import { useEffect, useState } from "react";
import { FiClock, FiFilter, FiRefreshCcw } from "react-icons/fi";
import { useSocket } from "../../../socket/SocketProvider";
import Axios from "../../../api/axios";
import orderApi from "../../../api/order.api";
import OrderCard from "../../../components/waiter/OrderCard";
import toast from "react-hot-toast";

export default function WaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const socket = useSocket();

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
      // Reload orders from API to get complete order data
      load(true);
    };

    const handleTableOrderPlaced = (data) => {
      console.log("🍽️ Table order placed:", data);
      // Reload orders from API to get complete order data
      load(true);
    };

    const handleStatusUpdate = (update) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id !== update.orderId) return order;
          return {
            ...order,
            items: order.items.map((item) => {
              if (item._id !== update.itemId) return item;
              return { ...item, itemStatus: update.status };
            }),
          };
        }),
      );
    };

    const handleItemStatusChanged = (data) => {
      const { orderId, itemId, itemIndex, itemStatus } = data;
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (String(order._id) !== String(orderId)) return order;
          return {
            ...order,
            items: order.items.map((item, idx) => {
              const matches =
                String(item._id) === String(itemId) || idx === itemIndex;
              if (!matches) return item;
              return { ...item, itemStatus };
            }),
          };
        }),
      );
    };

    socket.on("order:placed", handleNewOrder);
    socket.on("table:order-placed", handleTableOrderPlaced);
    socket.on("order:itemStatus", handleStatusUpdate);
    socket.on("table:item-status-changed", handleItemStatusChanged);

    return () => {
      socket.off("order:placed", handleNewOrder);
      socket.off("table:order-placed", handleTableOrderPlaced);
      socket.off("order:itemStatus", handleStatusUpdate);
      socket.off("table:item-status-changed", handleItemStatusChanged);
    };
  }, [socket]);

  const visibleOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter(
          (o) => String(o.orderStatus || "").toUpperCase() === statusFilter,
        );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
        <p className="text-sm text-gray-600 mt-1">
          Monitor incoming table orders and item status in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Kpi title="Total" value={orders.length} />
        <Kpi
          title="New"
          value={orders.filter((o) => o.orderStatus === "NEW").length}
          tone="orange"
        />
        <Kpi
          title="In Progress"
          value={orders.filter((o) => o.orderStatus === "IN_PROGRESS").length}
          tone="blue"
        />
        <Kpi
          title="Ready"
          value={orders.filter((o) => o.orderStatus === "READY").length}
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
            { label: "New", value: "NEW" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Ready", value: "READY" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`h-9 px-3 rounded-xl text-xs font-semibold border ${
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
