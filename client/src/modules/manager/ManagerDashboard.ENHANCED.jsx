/**
 * ManagerDashboard.ENHANCED.jsx
 *
 * Enhanced Manager Dashboard - Production Ready
 * ✅ Full analytics with charts
 * ✅ Real-time order tracking
 * ✅ KPI cards with trends
 * ✅ Export functionality
 * ✅ Fully responsive
 * ✅ Error boundaries
 *
 * Uses:
 * - AnalyticsDashboard: Complete analytics system
 * - ResponsiveContainer: Page wrapper
 * - ResponsiveGrid: Layout items
 * - ResponsiveTable: Order listings
 * - StatCard: KPI display
 * - ErrorBoundary: Error handling
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// API & Store
import { useSocket } from "../../socket/SocketProvider";
import AuthAxios from "../../api/authAxios";
import dashboardApi from "../../api/dashboard.api";

// NEW: UI Components
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import ResponsiveContainer from "../../components/ui/ResponsiveContainer";
import ResponsiveGrid from "../../components/ui/ResponsiveGrid";
import ResponsiveTable from "../../components/ui/ResponsiveTable";
import ResponsiveCard from "../../components/ui/ResponsiveCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import StatCard from "../../components/ui/StatCard";
import AnalyticsDashboard from "../../components/advanced/AnalyticsDashboard";
import ResponsiveText from "../../components/ui/ResponsiveText";
import Dropdown from "../../components/ui/DropDown";

/**
 * Manager Dashboard - Complete business analytics
 */
export default function ManagerDashboard() {
  const user = useSelector((state) => state.user);
  const socket = useSocket();
  const restaurantId = user?.restaurantId;

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

  // Dashboard State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgTime: 0,
    totalRevenue: 0,
  });

  // Filter State
  const [filters, setFilters] = useState({
    status: "all",
    timeRange: "today",
    sortBy: "recent",
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("7d");

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

  /**
   * Fetch orders from API
   */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const config = dashboardApi.getRecentOrders(100, filters.timeRange);
      const res = await AuthAxios.get(config.url, { params: config.params });

      if (res.data?.success) {
        const normalized = (res.data.data || []).map((o) => normalizeOrder(o));
        setOrders(normalized);
        applyFilters(normalized, filters);
        calculateStats(normalized);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [filters.timeRange, filters.status, filters.sortBy]);

  /**
   * Apply filters to orders
   */
  const applyFilters = (orderList, filterSettings) => {
    let filtered = orderList.map((o) => normalizeOrder(o));

    // Filter by status
    if (filterSettings.status !== "all") {
      filtered = filtered.filter(
        (o) => o.orderStatus === filterSettings.status,
      );
    }

    // Sort
    if (filterSettings.sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    } else if (filterSettings.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.placedAt) - new Date(b.placedAt));
    } else if (filterSettings.sortBy === "amount-high") {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setFilteredOrders(filtered);
  };

  /**
   * Calculate statistics
   */
  const calculateStats = (orderList) => {
    const normalized = orderList.map((o) => normalizeOrder(o));
    const completed = normalized.filter((o) => o.orderStatus === "SERVED");
    const pending = normalized.filter(
      (o) =>
        o.orderStatus === "NEW" ||
        o.orderStatus === "IN_PROGRESS" ||
        o.orderStatus === "SERVING" ||
        o.orderStatus === "READY",
    );

    setStats({
      totalOrders: normalized.length,
      completedOrders: completed.length,
      pendingOrders: pending.length,
      avgTime: Math.random() * 30,
      totalRevenue: normalized.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      ),
    });
  };

  /**
   * Initial load
   */
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const emitJoin = () => {
      socket.emit("join:restaurant", { restaurantId });
    };

    emitJoin();
    socket.on("connect", emitJoin);

    return () => {
      socket.off("connect", emitJoin);
    };
  }, [socket, restaurantId]);

  /**
   * Real-time socket updates
   */
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

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    applyFilters(orders, newFilters);
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
      toast.success("Dashboard refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Export orders to CSV
   */
  const exportOrders = () => {
    const csv = [
      ["Order #", "Table", "Items", "Amount", "Status", "Time"],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        o.tableName || "Takeaway",
        o.items?.length || 0,
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
    window.URL.revokeObjectURL(url);
    toast.success("Orders exported");
  };

  /**
   * Table columns
   */
  const orderColumns = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (val) => `#${val}`,
    },
    {
      key: "tableName",
      label: "Table",
      render: (val) => val || "Takeaway",
    },
    {
      key: "items",
      label: "Items",
      render: (val) => val?.length || 0,
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (val) => `₹${Math.round(val)}`,
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (val) => {
        const normalized = String(val || "NEW").toUpperCase();
        const progressMap = {
          NEW: { percent: 20, color: "bg-orange-500", label: "PLACED" },
          IN_PROGRESS: {
            percent: 40,
            color: "bg-yellow-500",
            label: "PREPARING",
          },
          SERVING: { percent: 60, color: "bg-indigo-500", label: "SERVING" },
          READY: { percent: 80, color: "bg-green-500", label: "READY" },
          SERVED: { percent: 100, color: "bg-blue-600", label: "SERVED" },
          CANCELLED: { percent: 0, color: "bg-slate-400", label: "CANCELLED" },
        };

        const progress = progressMap[normalized] || {
          percent: 20,
          color: "bg-slate-500",
          label: normalized.replaceAll("_", " "),
        };

        return (
          <div className="space-y-1">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(normalized)}`}
            >
              {progress.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progress.color} transition-all duration-500`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-600">
                {progress.percent}%
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  /**
   * Get status badge color
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return "bg-red-100 text-red-700";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "SERVING":
        return "bg-indigo-100 text-indigo-700";
      case "READY":
        return "bg-green-100 text-green-700";
      case "SERVED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // 🔴 LOADING STATE
  if (loading && !orders.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <LoadingSpinner size="lg" message="Loading Dashboard..." />
      </div>
    );
  }

  // ✅ MAIN CONTENT
  return (
    <ErrorBoundary>
      <ResponsiveContainer>
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 sm:py-8 border-b border-slate-200/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <ResponsiveText variant="heading1">
                Manager Dashboard
              </ResponsiveText>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Real-time order & revenue analytics
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 sm:h-12 px-3 sm:px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <FiRefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={exportOrders}
                className="h-10 sm:h-12 px-3 sm:px-4 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <FiDownload size={16} />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* ANALYTICS DASHBOARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 mb-10"
        >
          {restaurantId && (
            <AnalyticsDashboard
              restaurantId={restaurantId}
              dateRange={dateRange}
            />
          )}
        </motion.div>

        {/* KPI CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <ResponsiveText variant="heading2" className="mb-4">
            Quick Stats
          </ResponsiveText>
          <ResponsiveGrid>
            <StatCard
              icon={FiBarChart2}
              label="Total Orders"
              value={stats.totalOrders}
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Completed"
              value={stats.completedOrders}
              trend={
                stats.totalOrders > 0
                  ? Math.round(
                      (stats.completedOrders / stats.totalOrders) * 100,
                    )
                  : 0
              }
              bgColor="bg-green-50"
              borderColor="border-green-200"
              iconColor="text-green-600"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Pending"
              value={stats.pendingOrders}
              bgColor="bg-yellow-50"
              borderColor="border-yellow-200"
              iconColor="text-yellow-600"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Total Revenue"
              value={`₹${Math.round(stats.totalRevenue)}`}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
              iconColor="text-purple-600"
            />
          </ResponsiveGrid>
        </motion.div>

        {/* FILTERS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <ResponsiveText variant="heading3" className="mb-4">
            Filters
          </ResponsiveText>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-600 block mb-2">
                Status
              </label>
              <Dropdown
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
                placeholder="All"
                options={[
                  { value: "all", label: "All" },
                  { value: "NEW", label: "Placed" },
                  { value: "IN_PROGRESS", label: "Preparing" },
                  { value: "SERVING", label: "Serving" },
                  { value: "READY", label: "Ready" },
                  { value: "SERVED", label: "Served" },
                ]}
              />
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-600 block mb-2">
                Time Range
              </label>
              <Dropdown
                value={filters.timeRange}
                onChange={(value) => handleFilterChange("timeRange", value)}
                placeholder="Today"
                options={[
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                ]}
              />
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-slate-600 block mb-2">
                Sort By
              </label>
              <Dropdown
                value={filters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value)}
                placeholder="Most Recent"
                options={[
                  { value: "recent", label: "Most Recent" },
                  { value: "oldest", label: "Oldest" },
                  { value: "amount-high", label: "Highest Amount" },
                ]}
              />
            </div>
          </div>
        </motion.div>

        {/* ORDERS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <ResponsiveText variant="heading3" className="mb-4">
            Recent Orders ({filteredOrders.length})
          </ResponsiveText>
          <ResponsiveCard className="p-0">
            <ResponsiveTable
              columns={orderColumns}
              data={filteredOrders.slice(0, 20)}
              loading={loading}
            />
          </ResponsiveCard>
        </motion.div>
      </ResponsiveContainer>
    </ErrorBoundary>
  );
}
