import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../socket/SocketProvider";
import AuthAxios from "../../api/authAxios";
import toast from "react-hot-toast";
import useAdminOnboarding from "../../hooks/useAdminOnboarding";
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
import OnboardingGuide from "./components/OnboardingGuide";
import GettingStartedCard from "./components/GettingStartedCard";

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

  // Onboarding Guide
  const { showGuide, completeOnboarding, skipOnboarding } =
    useAdminOnboarding();

  // State Management
  const [timeRange, setTimeRange] = useState("today");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview | fraudAlerts | branchComparison
  const [showGettingStarted, setShowGettingStarted] = useState(!showGuide);

  // Custom Hooks - Data Fetching
  const {
    stats,
    loading: statsLoading,
    setStats,
  } = useDashboardStats(timeRange);
  const {
    recentOrders,
    loading: ordersLoading,
    upsertRecentOrder,
    refetch: refetchRecentOrders,
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
  useSocketUpdates(socket, setStats, upsertRecentOrder, refetchRecentOrders);

  useEffect(() => {
    if (!socket) return;

    const isMultiBranchAdmin = ["BRAND_ADMIN", "ADMIN", "OWNER"].includes(
      user?.role,
    );

    const joinTargets = selectedBranch
      ? [selectedBranch]
      : user?.restaurantId
        ? [user.restaurantId]
        : isMultiBranchAdmin
          ? (branches || []).map((b) => b?._id).filter(Boolean)
          : [];

    if (!joinTargets.length) return;

    let resyncTimer = null;

    const emitJoin = () => {
      joinTargets.forEach((restaurantId) => {
        socket.emit("join:restaurant", { restaurantId });
      });

      // Recover any events missed before room join completed.
      clearTimeout(resyncTimer);
      resyncTimer = setTimeout(() => {
        refetchRecentOrders?.({ silent: true });
      }, 150);
    };

    emitJoin();
    socket.on("connect", emitJoin);

    return () => {
      clearTimeout(resyncTimer);
      socket.off("connect", emitJoin);
    };
  }, [
    socket,
    selectedBranch,
    branches,
    user?.restaurantId,
    user?.role,
    refetchRecentOrders,
  ]);

  // Fetch fraud alerts
  useEffect(() => {
    const fetchFraudAlerts = async () => {
      try {
        const res = await AuthAxios.get(
          "/api/suspicious?limit=10&filter=PENDING_APPROVAL",
        );
        if (res.data?.success) {
          setFraudAlerts(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching fraud alerts:", error);
      }
    };

    fetchFraudAlerts();
    const interval = setInterval(fetchFraudAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Listen for fraud alerts from Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleFraudAlert = (fraudData) => {
      setFraudAlerts((prev) => [fraudData.order, ...prev.slice(0, 9)]);
      toast.error(
        `🚨 Fraud Alert: Order #${fraudData.order.orderNumber} - Risk ${fraudData.order.meta?.fraudScore || 0}%`,
      );
    };

    socket.on("fraud:alert", handleFraudAlert);

    return () => {
      socket.off("fraud:alert", handleFraudAlert);
    };
  }, [socket]);

  const approveFraudOrder = async (orderId) => {
    try {
      const res = await AuthAxios.put(`/api/order/${orderId}/approve`);
      if (res.data?.success) {
        toast.success("Order approved ✓");
        setFraudAlerts((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  const rejectFraudOrder = async (orderId) => {
    try {
      const reason = prompt("Reason for rejection:");
      if (!reason) return;

      const res = await AuthAxios.put(`/api/order/${orderId}/reject`, {
        reason,
      });
      if (res.data?.success) {
        toast.success("Order rejected ✓");
        setFraudAlerts((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  return (
    <>
      {/* Onboarding Guide Modal */}
      <OnboardingGuide
        isVisible={showGuide}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6 lg:p-8 space-y-10 sm:space-y-12 animate-in fade-in duration-500">
        {/* ============================================
          HEADER SECTION
          ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start lg:items-center">
          {/* Left: Greeting & Title */}
          <div className="col-span-1">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              📊 Admin Dashboard
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
                className={`px-4 sm:px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm capitalize transition-all active:scale-95 ${
                  timeRange === range
                    ? "bg-[#F35C2B] text-white startup-shadow"
                    : "bg-white text-slate-700 startup-shadow"
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
          GETTING STARTED CARD
          ============================================ */}
        {showGettingStarted && (
          <GettingStartedCard
            onClose={() => setShowGettingStarted(false)}
            onShowGuide={() => setShowGettingStarted(false)}
          />
        )}

        {/* ============================================
          TAB SELECTOR
          ============================================ */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-semibold text-sm transition ${
              activeTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📈 Overview
          </button>
          <button
            onClick={() => setActiveTab("fraudAlerts")}
            className={`px-4 py-3 font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "fraudAlerts"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🚨 Fraud Alerts
            {fraudAlerts.length > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {fraudAlerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("branchComparison")}
            className={`px-4 py-3 font-semibold text-sm transition ${
              activeTab === "branchComparison"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🏢 Multi-Branch
          </button>
        </div>

        {/* ============================================
          OVERVIEW TAB
          ============================================ */}
        {activeTab === "overview" && (
          <>
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
              {/* Left Column: Orders & Tracking (2/3 width) */}
              <div className="xl:col-span-2 space-y-8 lg:space-y-10">
                {/* Active Orders Tracking */}
                <RealTimeOrderTracking
                  activeOrders={recentOrders}
                  loading={ordersLoading}
                />

                {/* Recent Orders Table */}
                <RecentOrdersTable
                  orders={recentOrders}
                  loading={ordersLoading}
                />
              </div>

              {/* Right Column: Analytics Sidebar (1/3 width) */}
              <div className="space-y-8 lg:space-y-10">
                {/* Revenue Breakdown */}
                <RevenueBreakdown
                  breakdown={breakdown}
                  loading={revenueLoading}
                />

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
            <PerformanceMetrics
              staffData={topStaff}
              loading={performanceLoading}
            />
          </>
        )}

        {/* ============================================
          FRAUD ALERTS TAB
          ============================================ */}
        {activeTab === "fraudAlerts" && (
          <div className="bg-white border border-red-200 rounded-lg overflow-hidden">
            {fraudAlerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Order #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Restaurant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Table
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Fraud Reason
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Risk Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-red-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {fraudAlerts.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-red-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {order.restaurantId?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {order.tableName || "Takeaway"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-700">
                          {order.meta?.fraudReasons?.[0] ||
                            order.suspiciousReason ||
                            "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${Math.min(100, (order.meta?.fraudScore || 0) * 2)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-red-600">
                              {order.meta?.fraudScore || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveFraudOrder(order._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectFraudOrder(order._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 transition"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <p className="text-lg">✅ All orders are legitimate!</p>
                <p className="text-sm mt-2">No fraud alerts at the moment</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================
          MULTI-BRANCH COMPARISON TAB
          ============================================ */}
        {activeTab === "branchComparison" && (
          <div className="space-y-8">
            {/* KPI by Branch */}
            <div className="bg-white border border-slate-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                📊 Performance by Branch
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {branches && branches.length > 0 ? (
                  branches.map((branch) => (
                    <div
                      key={branch._id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <h4 className="font-bold text-slate-900 text-sm mb-3">
                        {branch.name}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Location</span>
                          <span className="font-semibold text-slate-900">
                            {branch.city || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status</span>
                          <span
                            className={`font-semibold ${branch.isActive ? "text-green-600" : "text-red-600"}`}
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tables</span>
                          <span className="font-semibold text-slate-900">
                            {branch.totalTables || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-8 text-slate-500">
                    <p>No branches available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Performance Metrics */}
            <PerformanceMetrics
              staffData={topStaff}
              loading={performanceLoading}
            />
          </div>
        )}
      </div>
    </>
  );
}
