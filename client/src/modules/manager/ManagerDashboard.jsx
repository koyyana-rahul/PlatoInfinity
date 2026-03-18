import React, { useState, useEffect, useCallback } from "react";
import {
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiDownload,
} from "react-icons/fi";
import { useSocket } from "../../socket/SocketProvider";
import { useSelector } from "react-redux";
import AuthAxios from "../../api/authAxios";
import dashboardApi from "../../api/dashboard.api";
import toast from "react-hot-toast";
import Dropdown from "../../components/ui/DropDown";

export default function ManagerDashboard() {
  const socket = useSocket();
  const restaurantId = useSelector((s) => s.user?.restaurantId);

  const getTotalQuantity = (items = []) =>
    (Array.isArray(items) ? items : []).reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0,
    );

  const normalizeStatus = (status) =>
    String(status || "").toUpperCase() || "NEW";

  const applyOrderLevelStatusToItems = (items = [], status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "SERVED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: "SERVED",
      }));
    }

    return Array.isArray(items) ? items : [];
  };

  const deriveOrderStatus = (order = {}) => {
    const fallback = normalizeStatus(
      order?.orderStatus || order?.status || "NEW",
    );

    if (["SERVED", "CANCELLED", "PAID"].includes(fallback)) {
      return fallback;
    }

    const items = Array.isArray(order?.items) ? order.items : [];
    const itemStatuses = items.map((it) =>
      String(it?.itemStatus || "").toUpperCase(),
    );
    const totalItems = itemStatuses.length;
    const servedCount = itemStatuses.filter((s) => s === "SERVED").length;

    if (totalItems > 0 && servedCount === totalItems) return "SERVED";
    if (itemStatuses.some((s) => s === "SERVING") || servedCount > 0)
      return "SERVING";
    if (itemStatuses.some((s) => s === "READY")) return "READY";
    if (itemStatuses.some((s) => s === "IN_PROGRESS")) return "IN_PROGRESS";

    return fallback;
  };

  const normalizeOrder = (order = {}) => ({
    ...order,
    _id: order._id || order.orderId,
    items: Array.isArray(order.items) ? order.items : [],
    orderStatus: deriveOrderStatus(order),
    placedAt: order.placedAt || order.createdAt || order.updatedAt,
  });

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalQuantity: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    timeRange: "today",
  });
  const [loading, setLoading] = useState(true);

  const applyFilters = (orderList, filterSettings) => {
    let filtered = orderList.map((o) => normalizeOrder(o));
    if (filterSettings.status !== "all") {
      filtered = filtered.filter(
        (o) => String(o.orderStatus) === String(filterSettings.status),
      );
    }
    filtered.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    setFilteredOrders(filtered);
  };

  const calculateStats = (orderList) => {
    const normalized = orderList.map((o) => normalizeOrder(o));
    const totalQuantity = normalized.reduce(
      (sum, order) => sum + getTotalQuantity(order.items),
      0,
    );
    const completed = normalized.filter(
      (o) => o.orderStatus === "SERVED",
    ).length;
    const pending = normalized.filter(
      (o) =>
        o.orderStatus === "NEW" ||
        o.orderStatus === "IN_PROGRESS" ||
        o.orderStatus === "SERVING" ||
        o.orderStatus === "READY",
    ).length;
    setStats({
      totalOrders: normalized.length,
      totalQuantity,
      completedOrders: completed,
      pendingOrders: pending,
      totalRevenue: normalized.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      ),
    });
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const config = dashboardApi.getRecentOrders(100, filters.timeRange);
      const res = await AuthAxios.get(config.url, { params: config.params });
      if (res.data?.success) {
        const list = (res.data.data || []).map((o) => normalizeOrder(o));
        setOrders(list);
        applyFilters(list, filters);
        calculateStats(list);
      }
    } catch (error) {
      console.error(
        "Failed to fetch orders:",
        error.response?.data?.message || error.message,
      );
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.status]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    let resyncTimer = null;

    const emitJoin = () => {
      socket.emit("join:restaurant", { restaurantId });

      clearTimeout(resyncTimer);
      resyncTimer = setTimeout(() => {
        fetchOrders();
      }, 150);
    };

    emitJoin();
    socket.on("connect", emitJoin);

    return () => {
      clearTimeout(resyncTimer);
      socket.off("connect", emitJoin);
    };
  }, [socket, restaurantId, fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (data) => {
      const incomingId = data?._id || data?.orderId;
      if (!incomingId) {
        fetchOrders();
        return;
      }

      setOrders((prev) => {
        const exists = prev.some((o) => String(o._id) === String(incomingId));
        const updated = exists
          ? prev.map((o) => {
              if (String(o._id) !== String(incomingId)) return o;

              const nextItems = (o.items || []).map((item, idx) => {
                const byId =
                  data.itemId && String(item._id) === String(data.itemId);
                const byIndex =
                  data.itemIndex !== undefined &&
                  data.itemIndex !== null &&
                  idx === data.itemIndex;
                return byId || byIndex
                  ? { ...item, itemStatus: data.itemStatus || item.itemStatus }
                  : item;
              });

              const incomingOrderStatus =
                data.orderStatus || data.status || o.orderStatus;
              const patchedItems =
                !data.itemId &&
                (data.itemIndex === undefined || data.itemIndex === null)
                  ? applyOrderLevelStatusToItems(nextItems, incomingOrderStatus)
                  : nextItems;

              return {
                ...o,
                ...data,
                _id: o._id,
                orderStatus: deriveOrderStatus({
                  ...o,
                  ...data,
                  orderStatus: incomingOrderStatus,
                  status: incomingOrderStatus,
                  items: patchedItems,
                }),
                items: patchedItems,
              };
            })
          : [normalizeOrder(data), ...prev];

        applyFilters(updated, filters);
        calculateStats(updated);
        return updated;
      });
    };

    const handleSocketReconnect = () => {
      fetchOrders();
    };

    socket.on("order:placed", handleOrderUpdate);
    socket.on("order:item-status-updated", handleOrderUpdate);
    socket.on("order:status-changed", handleOrderUpdate);
    socket.on("manager:order-status-changed", handleOrderUpdate);
    socket.on("order:ready", handleOrderUpdate);
    socket.on("order:ready-for-serving", handleOrderUpdate);
    socket.on("order:served", handleOrderUpdate);
    socket.on("order:cancelled", handleOrderUpdate);
    socket.on("table:item-status-changed", handleOrderUpdate);
    socket.on("waiter:item-ready-alert", handleOrderUpdate);
    socket.on("connect", handleSocketReconnect);

    return () => {
      socket.off("order:placed", handleOrderUpdate);
      socket.off("order:item-status-updated", handleOrderUpdate);
      socket.off("order:status-changed", handleOrderUpdate);
      socket.off("manager:order-status-changed", handleOrderUpdate);
      socket.off("order:ready", handleOrderUpdate);
      socket.off("order:ready-for-serving", handleOrderUpdate);
      socket.off("order:served", handleOrderUpdate);
      socket.off("order:cancelled", handleOrderUpdate);
      socket.off("table:item-status-changed", handleOrderUpdate);
      socket.off("waiter:item-ready-alert", handleOrderUpdate);
      socket.off("connect", handleSocketReconnect);
    };
  }, [socket, filters, fetchOrders]);

  const handleFilterChange = (field, value) => {
    const next = { ...filters, [field]: value };
    setFilters(next);
    applyFilters(orders, next);
  };

  const exportOrders = () => {
    const csv = [
      ["Order #", "Table", "Items", "Quantity", "Amount", "Status", "Time"],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        o.tableName || "Takeaway",
        o.items?.length || 0,
        getTotalQuantity(o.items),
        o.totalAmount,
        o.orderStatus,
        new Date(o.placedAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().getTime()}.csv`;
    a.click();
    toast.success("Orders exported");
  };

  const statusClass = (status) => {
    switch (status) {
      case "SERVED":
        return "bg-green-50 text-green-700";
      case "SERVING":
        return "bg-indigo-50 text-indigo-700";
      case "READY":
        return "bg-emerald-50 text-emerald-700";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700";
      case "NEW":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getStatusProgress = (status) => {
    const normalized = String(status || "NEW").toUpperCase();
    const progressMap = {
      NEW: { percent: 20, color: "bg-orange-500", label: "PLACED" },
      IN_PROGRESS: { percent: 40, color: "bg-blue-500", label: "PREPARING" },
      SERVING: { percent: 60, color: "bg-indigo-500", label: "SERVING" },
      READY: { percent: 80, color: "bg-emerald-500", label: "READY" },
      SERVED: { percent: 100, color: "bg-green-600", label: "SERVED" },
      CANCELLED: { percent: 0, color: "bg-slate-400", label: "CANCELLED" },
    };
    return (
      progressMap[normalized] || {
        percent: 20,
        color: "bg-slate-500",
        label: normalized.replaceAll("_", " "),
      }
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Kitchen Hub
            </h1>
            <p className="text-sm text-gray-600">
              Track live orders and performance
            </p>
          </div>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            <FiDownload size={16} />
            Export Orders
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <p className="text-sm text-red-700">Total Quantity</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.totalQuantity}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-sm text-blue-700">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-sm text-green-700">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.completedOrders}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <p className="text-sm text-orange-700">Revenue</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              ₹{stats.totalRevenue}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
              <Dropdown
                value={filters.timeRange}
                onChange={(value) => handleFilterChange("timeRange", value)}
                placeholder="Time Range"
                options={[
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                ]}
              />

              <Dropdown
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                placeholder="Status"
                options={[
                  { value: "all", label: "All Status" },
                  { value: "NEW", label: "Placed" },
                  { value: "IN_PROGRESS", label: "Preparing" },
                  { value: "SERVING", label: "Serving" },
                  { value: "READY", label: "Ready" },
                  { value: "SERVED", label: "Served" },
                ]}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-500">
                    <th className="py-3 pr-3">Order #</th>
                    <th className="py-3 pr-3">Table</th>
                    <th className="py-3 pr-3">Items</th>
                    <th className="py-3 pr-3">Qty</th>
                    <th className="py-3 pr-3">Amount</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="py-3 pr-3 font-semibold text-gray-900">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3 pr-3 text-gray-700">
                        {order.tableName || "Takeaway"}
                      </td>
                      <td className="py-3 pr-3 text-gray-700">
                        {order.items?.length || 0}
                      </td>
                      <td className="py-3 pr-3 text-gray-700 font-semibold">
                        {getTotalQuantity(order.items)}
                      </td>
                      <td className="py-3 pr-3 text-gray-700">
                        ₹{order.totalAmount || 0}
                      </td>
                      <td className="py-3 pr-3">
                        {(() => {
                          const progress = getStatusProgress(order.orderStatus);
                          return (
                            <div className="space-y-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(order.orderStatus)}`}
                              >
                                {progress.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${progress.color} transition-all duration-500`}
                                    style={{ width: `${progress.percent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-600">
                                  {progress.percent}%
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 text-gray-500 text-sm">
                        {new Date(order.placedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
