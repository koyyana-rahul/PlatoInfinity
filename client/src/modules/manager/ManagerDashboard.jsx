import React, { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiDownload,
} from "react-icons/fi";
import { useSocket } from "../../socket/SocketProvider";
import AuthAxios from "../../api/authAxios";
import dashboardApi from "../../api/dashboard.api";
import toast from "react-hot-toast";

export default function ManagerDashboard() {
  const socket = useSocket();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
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
    let filtered = [...orderList];
    if (filterSettings.status !== "all") {
      filtered = filtered.filter(
        (o) => o.orderStatus === filterSettings.status,
      );
    }
    filtered.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    setFilteredOrders(filtered);
  };

  const calculateStats = (orderList) => {
    const completed = orderList.filter(
      (o) => o.orderStatus === "SERVED",
    ).length;
    const pending = orderList.filter(
      (o) => o.orderStatus === "NEW" || o.orderStatus === "IN_PROGRESS",
    ).length;
    setStats({
      totalOrders: orderList.length,
      completedOrders: completed,
      pendingOrders: pending,
      totalRevenue: orderList.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const config = dashboardApi.getRecentOrders(100, filters.timeRange);
        const res = await AuthAxios.get(config.url, { params: config.params });
        if (res.data?.success) {
          const list = res.data.data || [];
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
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filters.timeRange]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (data) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === data._id);
        const updated = exists
          ? prev.map((o) => (o._id === data._id ? { ...o, ...data } : o))
          : [data, ...prev];
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
    const next = { ...filters, [field]: value };
    setFilters(next);
    applyFilters(orders, next);
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

  const statusClass = (status) => {
    switch (status) {
      case "SERVED":
        return "bg-green-50 text-green-700";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700";
      case "NEW":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalOrders}
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
            <div className="flex gap-2">
              <select
                value={filters.timeRange}
                onChange={(e) =>
                  handleFilterChange("timeRange", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="SERVED">Served</option>
              </select>
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
                      <td className="py-3 pr-3 text-gray-700">
                        ₹{order.totalAmount || 0}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(order.orderStatus)}`}
                        >
                          {order.orderStatus?.replaceAll("_", " ")}
                        </span>
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
                        colSpan={6}
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
