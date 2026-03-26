import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  const normalizeStatus = (status) => {
    const raw = String(status || "")
      .toUpperCase()
      .trim();

    const statusAliasMap = {
      OPEN: "NEW",
      PLACED: "NEW",
      PENDING: "NEW",
      PREPARING: "IN_PROGRESS",
      PREP: "IN_PROGRESS",
      COOKING: "IN_PROGRESS",
      COMPLETE: "SERVED",
      COMPLETED: "SERVED",
    };

    return statusAliasMap[raw] || raw || "NEW";
  };

  const applyOrderLevelStatusToItems = (items = [], status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "SERVED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: "SERVED",
      }));
    }

    if (normalized === "CANCELLED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: item.itemStatus === "SERVED" ? "SERVED" : "CANCELLED",
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
    cancelReason: order.cancelReason || order.meta?.cancelReason || null,
    cancelledByRole:
      order.cancelledByRole || order.meta?.cancelledByRole || null,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [compactMode, setCompactMode] = useState(true);

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
                cancelReason:
                  data.reason ||
                  data.cancelReason ||
                  data.meta?.cancelReason ||
                  o.cancelReason ||
                  o.meta?.cancelReason ||
                  null,
                cancelledByRole:
                  data.cancelledByRole ||
                  data.meta?.cancelledByRole ||
                  o.cancelledByRole ||
                  o.meta?.cancelledByRole ||
                  null,
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
      case "CANCELLED":
        return "bg-red-50 text-red-700";
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

  const formatOrderDateTimeParts = (timestamp) => {
    if (!timestamp) return { date: "-", time: "-" };
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return { date: "-", time: "-" };

    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };
  };

  const rowsPerPageOptions = [
    { value: 10, label: "10 rows / page" },
    { value: 25, label: "25 rows / page" },
    { value: 50, label: "50 rows / page" },
  ];

  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredOrders / rowsPerPage));
  const startIndex =
    totalFilteredOrders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalFilteredOrders);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const compactClass = compactMode ? "py-2" : "py-3";
  const compactCellTextClass = compactMode ? "text-xs" : "text-sm";

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-2.5 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 transition-all">
              Kitchen Hub
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Track live orders and performance
            </p>
          </div>
          <button
            onClick={exportOrders}
            className="flex items-center gap-1 px-2 xs:gap-2 xs:px-4 py-2 xs:py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full font-bold shadow-sm hover:from-orange-600 hover:to-orange-500 transition-all duration-200 hover:-translate-y-0.5 text-xs xs:text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <span className="flex items-center justify-center bg-white bg-opacity-20 rounded-full p-1 mr-1 xs:mr-2">
              <FiDownload size={18} />
            </span>
            <span className="ml-1 text-center text-[10px] xs:text-[10px] sm:text-xs leading-tight font-medium">
              Export Orders
            </span>
          </button>
        </div>

        {/* Stats grid: 3 cols on mobile, 5 on desktop */}
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-3">
          <div className="bg-gray-50 rounded-lg p-2.5 sm:p-4 border border-gray-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] sm:text-sm text-gray-600">Total Orders</p>
            <p className="text-lg sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-2.5 sm:p-4 border border-red-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] sm:text-sm text-red-700">
              Total Quantity
            </p>
            <p className="text-lg sm:text-3xl font-bold text-red-600 mt-1 sm:mt-2">
              {stats.totalQuantity}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5 sm:p-4 border border-blue-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] sm:text-sm text-blue-700">In Progress</p>
            <p className="text-lg sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 sm:p-4 border border-green-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] sm:text-sm text-green-700">Completed</p>
            <p className="text-lg sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">
              {stats.completedOrders}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-2.5 sm:p-4 border border-orange-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[11px] sm:text-sm text-orange-700">Revenue</p>
            <p className="text-lg sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">
              ₹{stats.totalRevenue}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mb-4">
            <div className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md text-center sm:text-left whitespace-nowrap">
              Showing {startIndex}-{endIndex} of {totalFilteredOrders}
            </div>

            <div className="w-full min-w-0">
              <Dropdown
                value={rowsPerPage}
                onChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                placeholder="Rows per page"
                options={rowsPerPageOptions}
              />
            </div>

            <button
              type="button"
              onClick={() => setCompactMode((prev) => !prev)}
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              {compactMode ? "Comfortable view" : "Compact view"}
            </button>
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
            <>
              <div className="hidden lg:block">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-500">
                      <th className="py-3 pr-3">Order #</th>
                      <th className="py-3 pr-3">Table</th>
                      <th className="py-3 pr-3">Items</th>
                      <th className="py-3 pr-3">Qty</th>
                      <th className="py-3 pr-3">Amount</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3">Date & Time</th>
                      <th className="py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => {
                      const dateTime = formatOrderDateTimeParts(order.placedAt);
                      return (
                        <tr
                          key={order._id}
                          className="border-b border-gray-100"
                        >
                          <td
                            className={`${compactClass} pr-3 font-semibold text-gray-900 whitespace-nowrap ${compactCellTextClass}`}
                          >
                            #{order.orderNumber}
                          </td>
                          <td
                            className={`${compactClass} pr-3 text-gray-700 whitespace-nowrap ${compactCellTextClass}`}
                          >
                            {order.tableName || "Takeaway"}
                          </td>
                          <td
                            className={`${compactClass} pr-3 text-gray-700 whitespace-nowrap ${compactCellTextClass}`}
                          >
                            {order.items?.length || 0}
                          </td>
                          <td
                            className={`${compactClass} pr-3 text-gray-700 font-semibold whitespace-nowrap ${compactCellTextClass}`}
                          >
                            {getTotalQuantity(order.items)}
                          </td>
                          <td
                            className={`${compactClass} pr-3 text-gray-700 whitespace-nowrap ${compactCellTextClass}`}
                          >
                            ₹{order.totalAmount || 0}
                          </td>
                          <td className={`${compactClass} pr-3`}>
                            {(() => {
                              const progress = getStatusProgress(
                                order.orderStatus,
                              );
                              return (
                                <div className="space-y-1">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(order.orderStatus)}`}
                                  >
                                    {progress.label}
                                  </span>
                                  {(order.orderStatus === "CANCELLED" ||
                                    order.status === "CANCELLED") && (
                                    <div className="text-[10px] text-red-600 font-semibold">
                                      Cancelled by{" "}
                                      {order.cancelledByRole || "Staff"}
                                      {order.cancelReason
                                        ? ` • ${order.cancelReason}`
                                        : ""}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${progress.color} transition-all duration-500`}
                                        style={{
                                          width: `${progress.percent}%`,
                                        }}
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
                          <td
                            className={`${compactClass} text-xs text-gray-500`}
                          >
                            <div className="leading-tight">
                              <p className="font-semibold text-gray-700">
                                {dateTime.date}
                              </p>
                              <p>{dateTime.time}</p>
                            </div>
                          </td>
                          <td className={compactClass}></td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-8 text-center text-gray-500"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No orders found.
                  </div>
                ) : (
                  paginatedOrders.map((order) => {
                    const progress = getStatusProgress(order.orderStatus);
                    const dateTime = formatOrderDateTimeParts(order.placedAt);
                    return (
                      <div
                        key={order._id}
                        className={`border border-gray-200 rounded-lg ${compactMode ? "p-3 space-y-2" : "p-4 space-y-3"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              #{order.orderNumber}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {order.tableName || "Takeaway"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(order.orderStatus)}`}
                          >
                            {progress.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-gray-500">Items / Qty</p>
                            <p className="font-semibold text-gray-800">
                              {order.items?.length || 0} /{" "}
                              {getTotalQuantity(order.items)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-gray-500">Amount</p>
                            <p className="font-semibold text-gray-800">
                              ₹{order.totalAmount || 0}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded p-2 col-span-2">
                            <p className="text-gray-500">Date & Time</p>
                            <p className="font-semibold text-gray-800">
                              {dateTime.date}
                            </p>
                            <p className="text-gray-600">{dateTime.time}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${progress.color} transition-all duration-500`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-600">
                            {progress.percent}%
                          </span>
                        </div>

                        {(order.orderStatus === "CANCELLED" ||
                          order.status === "CANCELLED") && (
                          <div className="text-[11px] text-red-600 font-semibold">
                            Cancelled by {order.cancelledByRole || "Staff"}
                            {order.cancelReason
                              ? ` • ${order.cancelReason}`
                              : ""}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-100 mt-3 pt-3 px-1 sm:px-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="text-xs sm:text-sm font-semibold text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
