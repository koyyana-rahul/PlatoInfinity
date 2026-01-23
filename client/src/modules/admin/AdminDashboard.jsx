import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../socket/SocketProvider";
import {
  useDashboardStats,
  useRecentOrders,
  useSocketUpdates,
  useBranches,
  useNotifications,
  useKPIMetrics,
  usePerformanceMetrics,
  useOperationalMetrics,
  useRevenueBreakdown,
} from "./hooks";
import {
  DashboardHeader,
  StatsGrid,
  RecentOrdersTable,
  BranchSelector,
  KPIDashboard,
  NotificationsCenter,
  RealTimeOrderTracking,
  PerformanceMetrics,
  OperationalMetrics,
  QuickActions,
  RevenueBreakdown,
} from "./components";

/**
 * AdminDashboard Component - Professional Food Restaurant Management Dashboard
 *
 * Real-World Features (Like Swiggy, Zomato, UberEats Admin Panels):
 * ✅ KPI Dashboard - Revenue, Orders, Completion Rate, Avg Order Value
 * ✅ Real-Time Order Tracking - Active orders with status timeline
 * ✅ Branch/Multi-Location Support - Filter by branch
 * ✅ Notifications Center - Order alerts, delays, issues
 * ✅ Staff Performance - Top performers, metrics
 * ✅ Operational Metrics - Prep time, satisfaction, waste
 * ✅ Quick Actions - Common admin tasks
 * ✅ Revenue Breakdown - By category, payment method
 * ✅ Live Stats with Auto-Refresh
 * ✅ Socket Integration for Real-Time Updates
 */
export default function AdminDashboard() {
  const user = useSelector((state) => state.user);
  const socket = useSocket();

  // State Management
  const [timeRange, setTimeRange] = useState("today");
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Custom Hooks - Data Fetching
  const {
    stats,
    loading: statsLoading,
    setStats,
  } = useDashboardStats(timeRange);
  const {
    recentOrders,
    loading: ordersLoading,
    addRecentOrder,
  } = useRecentOrders(timeRange, selectedBranch);
  const { branches, loading: branchesLoading } = useBranches();
  const { notifications, dismissNotification } = useNotifications(socket);

  // New Professional Dashboard Hooks
  const { metrics: kpiMetrics, loading: kpiLoading } = useKPIMetrics(
    timeRange,
    selectedBranch,
  );
  const { topStaff, loading: performanceLoading } =
    usePerformanceMetrics(selectedBranch);
  const { operationalData, loading: operationalLoading } =
    useOperationalMetrics(timeRange, selectedBranch);
  const { breakdown, loading: revenueLoading } = useRevenueBreakdown(
    timeRange,
    selectedBranch,
  );

  // Real-time Updates
  useSocketUpdates(socket, setStats, addRecentOrder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* ============================================
          HEADER SECTION
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start lg:items-center">
        {/* Left: Greeting & Title */}
        <div className="col-span-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            📊 Dashboard
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Welcome back,{" "}
            <span className="font-bold">{user?.name || "Admin"}</span>
          </p>
        </div>

        {/* Center: Time Range Selector */}
        <div className="flex items-center justify-center gap-2">
          {["today", "week", "month"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm capitalize transition ${
                timeRange === range
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Right: Branch Selector & Notifications */}
        <div className="flex items-center justify-end gap-3 flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-auto">
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              loading={branchesLoading}
            />
          </div>
          <NotificationsCenter
            notifications={notifications}
            onDismiss={dismissNotification}
            loading={false}
          />
        </div>
      </div>

      {/* ============================================
          QUICK ACTIONS
          ============================================ */}
      <QuickActions />

      {/* ============================================
          KPI DASHBOARD
          ============================================ */}
      <KPIDashboard stats={kpiMetrics} loading={kpiLoading} />

      {/* ============================================
          MAIN CONTENT GRID - Responsive Layout
          ============================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Orders & Tracking (2/3 width) */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          {/* Active Orders Tracking */}
          <RealTimeOrderTracking
            activeOrders={recentOrders}
            loading={ordersLoading}
          />

          {/* Recent Orders Table */}
          <RecentOrdersTable orders={recentOrders} loading={ordersLoading} />
        </div>

        {/* Right Column: Analytics Sidebar (1/3 width) */}
        <div className="space-y-6 lg:space-y-8">
          {/* Revenue Breakdown */}
          <RevenueBreakdown breakdown={breakdown} loading={revenueLoading} />

          {/* Operational Metrics */}
          <OperationalMetrics
            metrics={operationalData}
            loading={operationalLoading}
          />
        </div>
      </div>

      {/* ============================================
          STAFF PERFORMANCE
          ============================================ */}
      <PerformanceMetrics staffData={topStaff} loading={performanceLoading} />
    </div>
  );
}
