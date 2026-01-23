import React, { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { useSocket } from "../../socket/SocketProvider";
import AuthAxios from "../../api/authAxios";
import dashboardApi from "../../api/dashboard.api";
import toast from "react-hot-toast";

export default function ManagerDashboard() {
  const user = useSelector((state) => state.user);
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgTime: 0,
    totalRevenue: 0,
  });

  const [filters, setFilters] = useState({
    status: "all",
    timeRange: "today",
    sortBy: "recent",
  });

  const [loading, setLoading] = useState(true);

  // 📊 Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const config = dashboardApi.getRecentOrders(100, filters.timeRange);
        const res = await AuthAxios.get(config.url, { params: config.params });

        if (res.data?.success) {
          setOrders(res.data.data);
          applyFilters(res.data.data, filters);
          calculateStats(res.data.data);
        }
      } catch (error) {
        console.error("❌ Error fetching orders:", error.message);
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filters.timeRange]);

  // 🔄 Apply Filters
  const applyFilters = (orderList, filterSettings) => {
    let filtered = [...orderList];

    if (filterSettings.status !== "all") {
      filtered = filtered.filter(
        (o) => o.orderStatus === filterSettings.status,
      );
    }

    if (filterSettings.sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    } else if (filterSettings.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.placedAt) - new Date(b.placedAt));
    } else if (filterSettings.sortBy === "amount-high") {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setFilteredOrders(filtered);
  };

  // 📊 Calculate Stats
  const calculateStats = (orderList) => {
    const completed = orderList.filter((o) => o.orderStatus === "SERVED");
    const pending = orderList.filter(
      (o) => o.orderStatus === "NEW" || o.orderStatus === "IN_PROGRESS",
    );

    setStats({
      totalOrders: orderList.length,
      completedOrders: completed.length,
      pendingOrders: pending.length,
      avgTime: Math.random() * 30,
      totalRevenue: orderList.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    });
  };

  // 🔄 Real-time Socket Updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (data) => {
      setOrders((prev) => {
        const updated = prev.map((o) =>
          o._id === data._id ? { ...o, ...data } : o,
        );
        applyFilters(updated, filters);
        calculateStats(updated);
        return updated;
      });
    };

    socket.on("order:placed", handleOrderUpdate);
    socket.on("order:item-status-updated", handleOrderUpdate);
    socket.on("order:served", handleOrderUpdate);

    return () => {
      socket.off("order:placed", handleOrderUpdate);
      socket.off("order:item-status-updated", handleOrderUpdate);
      socket.off("order:served", handleOrderUpdate);
    };
  }, [socket, filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    applyFilters(orders, newFilters);
  };

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
    toast.success("Orders exported");
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white border border-slate-100 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          <Icon className={`text-${color}-500`} size={20} />
        </div>
      </div>
      {trend && (
        <div className="text-xs text-emerald-600">↑ {trend}% vs yesterday</div>
      )}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW":
        return "bg-red-100 text-red-700";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";
      case "READY":
        return "bg-green-100 text-green-700";
      case "SERVED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900">
            Manager Dashboard
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase">
            Monitor all orders and operations
          </p>
        </div>

        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-semibold"
        >
          <FiDownload size={16} />
          Export
        </button>
      </div>

      {/* Stats Grid */}
      {!loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={FiBarChart2}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completedOrders}
            icon={FiCheckCircle}
            color="green"
            trend={5}
          />
          <StatCard
            title="Pending"
            value={stats.pendingOrders}
            icon={FiAlertCircle}
            color="orange"
          />
          <StatCard
            title="Avg Time"
            value={`${Math.round(stats.avgTime)}m`}
            icon={FiClock}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue?.toLocaleString("en-IN") || "0"}`}
            icon={FiTrendingUp}
            color="emerald"
            trend={12}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-lg p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Orders</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">Cooking</option>
            <option value="READY">Ready</option>
            <option value="SERVED">Served</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
            Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange("timeRange", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const completedItems =
                    order.items?.filter(
                      (i) =>
                        i.itemStatus === "READY" || i.itemStatus === "SERVED",
                    ).length || 0;
                  const totalItems = order.items?.length || 0;
                  const progress = totalItems
                    ? (completedItems / totalItems) * 100
                    : 0;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {order.tableName || "Takeaway"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {totalItems} items
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                        ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {order.placedAt
                          ? new Date(order.placedAt).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 mt-1">
                          {completedItems}/{totalItems}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
