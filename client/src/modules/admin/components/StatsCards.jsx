import React from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiLayers,
  FiUsers,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";

/**
 * Reusable StatCard Component
 * Displays a single statistic with icon, value, and optional trend
 */
export const StatCard = ({ title, value, icon: Icon, color, trend }) => (
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
      <div className="flex items-center gap-1 text-xs text-emerald-600">
        <FiTrendingUp size={14} />
        <span>{trend}% from yesterday</span>
      </div>
    )}
  </div>
);

/**
 * Stats Grid Component
 * Displays all dashboard statistics in a responsive grid
 */
export const StatsGrid = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Sales"
        value={`₹${stats.totalSales?.toLocaleString("en-IN") || "0"}`}
        icon={FiDollarSign}
        color="emerald"
        trend={12}
      />
      <StatCard
        title="Orders Today"
        value={stats.ordersToday || "0"}
        icon={FiShoppingBag}
        color="blue"
        trend={8}
      />
      <StatCard
        title="Active Tables"
        value={stats.activeTables || "0"}
        icon={FiLayers}
        color="orange"
      />
      <StatCard
        title="Avg Order Value"
        value={`₹${stats.averageOrderValue || "0"}`}
        icon={FiActivity}
        color="purple"
      />
      <StatCard
        title="Completion Rate"
        value={`${stats.completionRate || "0"}%`}
        icon={FiTrendingUp}
        color="indigo"
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers || "0"}
        icon={FiUsers}
        color="pink"
      />
    </div>
  );
};
