import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../../api/axios";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState("today");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await Axios.get(`/api/dashboard/kpi?range=${timeRange}`);

      if (response.data?.data) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      toast.error("Failed to load analytics");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Icon size={20} className="text-[#FC8019]" />
        </div>
        {trend !== undefined && (
          <span
            className={clsx(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full",
              trend >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {unit && <p className="text-gray-500 text-xs">{unit}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Track your business metrics and KPIs in real-time
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]",
              refreshing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
            )}
          >
            {refreshing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-4 border border-gray-200">
          {["today", "week", "month"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={clsx(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                timeRange === range
                  ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 text-[#FC8019] mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading analytics...</p>
            </div>
          </div>
        ) : !metrics ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">
              Failed to load analytics data
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={TrendingUp}
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
                icon={ShoppingCart}
                label="Total Orders"
                value={metrics.ordersToday || 0}
                unit="Orders"
                trend={metrics.ordersTrend}
              />
              <StatCard
                icon={BarChart3}
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
                icon={Users}
                label="Active Tables"
                value={metrics.activeTables || 0}
                unit="Occupied"
                trend={undefined}
              />
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Orders Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-[#FC8019]" />
                  Orders Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">
                      Total Orders
                    </span>
                    <span className="font-bold text-[#FC8019]">
                      {metrics.ordersToday || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">
                      Completion
                    </span>
                    <span className="font-bold text-green-600">
                      {metrics.completionRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Avg Value</span>
                    <span className="font-bold text-gray-900">
                      ₹
                      {typeof metrics.averageOrderValue === "number"
                        ? metrics.averageOrderValue.toFixed(0)
                        : metrics.averageOrderValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tables Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-[#FC8019]" />
                  Tables Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">
                      Active Tables
                    </span>
                    <span className="font-bold text-[#FC8019]">
                      {metrics.activeTables || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">
                      Active Users
                    </span>
                    <span className="font-bold text-green-600">
                      {metrics.activeUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                      Revenue Trend
                    </span>
                    <span className="font-bold text-gray-900">
                      {metrics.revenueTrend >= 0 ? "+" : ""}
                      {metrics.revenueTrend || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg p-5 text-white">
                <h3 className="text-sm font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="bg-white/15 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-white/80 text-xs font-medium">
                      Revenue/Order
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      ₹
                      {metrics.averageOrderValue
                        ? Math.round(metrics.averageOrderValue)
                        : 0}
                    </p>
                  </div>
                  <div className="bg-white/15 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-white/80 text-xs font-medium">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {Math.round(metrics.completionRate || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#FC8019]" />
                Sales Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-gray-600 text-xs font-semibold">
                    Total Sales
                  </p>
                  <p className="text-xl font-bold text-[#FC8019] mt-2">
                    ₹
                    {typeof metrics.totalSales === "number"
                      ? Math.round(metrics.totalSales)
                      : metrics.totalSales}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-gray-600 text-xs font-semibold">Orders</p>
                  <p className="text-xl font-bold text-green-600 mt-2">
                    {metrics.ordersToday || 0}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-600 text-xs font-semibold">
                    Avg/Order
                  </p>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    ₹
                    {typeof metrics.averageOrderValue === "number"
                      ? Math.round(metrics.averageOrderValue)
                      : metrics.averageOrderValue}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-gray-600 text-xs font-semibold">
                    Success Rate
                  </p>
                  <p className="text-xl font-bold text-purple-600 mt-2">
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
