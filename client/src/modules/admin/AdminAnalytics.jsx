import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../../api/axios";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiUsers,
  FiShoppingCart,
  FiBarChart2,
  FiRefreshCw,
} from "react-icons/fi";

/**
 * Admin Analytics Page
 * Displays KPIs and performance metrics
 */
export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState("today");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/api/dashboard/kpi?range=${timeRange}`);

      if (response.data?.data) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, trend }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-300/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
          <Icon size={24} className="text-blue-600" />
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              trend >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-slate-600 text-sm font-semibold mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {unit && <p className="text-slate-500 text-xs font-medium">{unit}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              📊 Analytics
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Monitor your business performance and key metrics
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold w-full sm:w-auto justify-center sm:justify-start"
          >
            <FiRefreshCw size={18} />
            Refresh Data
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 bg-white rounded-lg p-4 sm:p-6 border border-slate-200 shadow-sm">
          {["today", "week", "month"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm transition-all capitalize ${
                timeRange === range
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {range === "today" && "📅"}
              {range === "week" && "📆"}
              {range === "month" && "📋"}
              {" " + range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-500 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading analytics...</p>
            </div>
          </div>
        ) : !metrics ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
            <p className="text-slate-500 text-lg">
              Failed to load analytics data
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Try refreshing the page or contact support
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                icon={FiTrendingUp}
                label="Total Sales"
                value={`₹${
                  typeof metrics.totalSales === "number"
                    ? metrics.totalSales.toFixed(2)
                    : metrics.totalSales
                }`}
                unit="Revenue"
                trend={metrics.revenueTrend}
              />
              <StatCard
                icon={FiShoppingCart}
                label="Total Orders"
                value={metrics.ordersToday || 0}
                unit="Orders"
                trend={metrics.ordersTrend}
              />
              <StatCard
                icon={FiBarChart2}
                label="Completion Rate"
                value={`${
                  typeof metrics.completionRate === "number"
                    ? metrics.completionRate.toFixed(1)
                    : metrics.completionRate
                }%`}
                unit="Success"
                trend={metrics.completionTrend}
              />
              <StatCard
                icon={FiUsers}
                label="Active Tables"
                value={metrics.activeTables || 0}
                unit="Occupied"
                trend={undefined}
              />
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Orders Overview */}
              <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  🛒 Orders Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">
                      Total Orders
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {metrics.ordersToday || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">
                      Completion Rate
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {metrics.completionRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      Avg Value
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      ₹
                      {typeof metrics.averageOrderValue === "number"
                        ? metrics.averageOrderValue.toFixed(0)
                        : metrics.averageOrderValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tables Overview */}
              <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  🪑 Tables Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">
                      Active Tables
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      {metrics.activeTables || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">
                      Active Users
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {metrics.activeUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      Revenue Trend
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {metrics.revenueTrend >= 0 ? "+" : ""}
                      {metrics.revenueTrend || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-1 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-6">💡 Quick Stats</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-indigo-100 text-sm font-medium">
                      Revenue/Order
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      ₹
                      {metrics.averageOrderValue
                        ? Math.round(metrics.averageOrderValue)
                        : 0}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-indigo-100 text-sm font-medium">
                      Completion
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {Math.round(metrics.completionRate || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                💰 Sales Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
                  <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                    Total Sales
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                    ₹
                    {typeof metrics.totalSales === "number"
                      ? Math.round(metrics.totalSales)
                      : metrics.totalSales}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 sm:p-6 border border-emerald-200">
                  <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                    Orders
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
                    {metrics.ordersToday || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 border border-purple-200">
                  <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                    Avg/Order
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
                    ₹
                    {typeof metrics.averageOrderValue === "number"
                      ? Math.round(metrics.averageOrderValue)
                      : metrics.averageOrderValue}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 sm:p-6 border border-orange-200">
                  <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                    Success
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-2">
                    {Math.round(metrics.completionRate || 0)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
