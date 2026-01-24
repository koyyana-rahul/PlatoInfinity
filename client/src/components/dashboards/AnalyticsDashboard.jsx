/**
 * AnalyticsDashboard.jsx
 * Production-ready analytics dashboard with charts and metrics
 * Fully responsive for all screen sizes
 */

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Download, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import Axios from "../api/axios";
import dashboardApi from "../api/dashboard.api";
import StatCard from "./components/ui/StatCard";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import EmptyState from "./components/ui/EmptyState";
import ResponsiveContainer from "./components/ui/ResponsiveContainer";

export default function AnalyticsDashboard({ restaurantId, dateRange = "7d" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(dateRange);

  useEffect(() => {
    loadAnalytics();
  }, [restaurantId, selectedRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await Axios(
        dashboardApi.getAnalytics(restaurantId, selectedRange),
      );
      setData(res.data?.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await Axios({
        ...dashboardApi.exportAnalytics(restaurantId, selectedRange),
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analytics-${selectedRange}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Data Available"
        message="Analytics data will appear here once you have orders."
      />
    );
  }

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <ResponsiveContainer>
      <div className="space-y-6 sm:space-y-8 py-6 sm:py-8">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Track your restaurant performance
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range === "7d"
                  ? "7 Days"
                  : range === "30d"
                    ? "30 Days"
                    : range === "90d"
                      ? "90 Days"
                      : "1 Year"}
              </button>
            ))}
            <button
              onClick={handleExport}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Total Revenue"
            value={`₹${data.totalRevenue?.toLocaleString("en-IN") || 0}`}
            trend={data.revenueTrend || 0}
            trendLabel="vs last period"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-200"
            iconColor="text-emerald-600"
            icon={TrendingUp}
          />
          <StatCard
            label="Total Orders"
            value={data.totalOrders || 0}
            trend={data.ordersTrend || 0}
            trendLabel="vs last period"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            iconColor="text-blue-600"
            icon={TrendingUp}
          />
          <StatCard
            label="Avg Bill Value"
            value={`₹${(data.avgBillValue || 0).toFixed(0)}`}
            trend={data.avgBillTrend || 0}
            trendLabel="vs last period"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            iconColor="text-purple-600"
            icon={TrendingUp}
          />
          <StatCard
            label="Completion Rate"
            value={`${(data.completionRate || 0).toFixed(1)}%`}
            trend={data.completionTrend || 0}
            trendLabel="vs last period"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            iconColor="text-orange-600"
            icon={TrendingUp}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Revenue Trend */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Order Status
            </h3>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.orderStatus || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(data.orderStatus || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Top Selling Items
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {(data.topItems || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-700 flex-1 truncate">
                    {item.name}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600 ml-2">
                    {item.count} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Orders by Hour
            </h3>
            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Payment Methods
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {(data.paymentMethods || []).map((method, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-4 bg-gray-50 rounded-lg text-center"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  {method.name}
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {method.count}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((method.count / data.totalOrders) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
