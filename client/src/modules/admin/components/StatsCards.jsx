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
  <div
    className="bg-white border border-slate-100 rounded-lg p-2 xs:p-2 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200"
    style={{ minWidth: 0 }}
  >
    <div className="flex justify-between items-start mb-1 xs:mb-1 sm:mb-2 md:mb-3">
      <div>
        <p className="text-[10px] xs:text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5 xs:mb-0.5 sm:mb-1">
          {title}
        </p>
        <p
          className={`text-base xs:text-base sm:text-lg md:text-2xl font-bold text-${color}-600 transition-colors`}
        >
          {value}
        </p>
      </div>
      <div
        className={`p-1 xs:p-1 sm:p-2 bg-${color}-50 rounded-lg transition-colors`}
      >
        <Icon className={`text-${color}-500`} size={16} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-0.5 xs:gap-0.5 sm:gap-1 text-[10px] xs:text-[10px] sm:text-xs text-emerald-600">
        <FiTrendingUp size={12} />
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
      <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 xs:gap-1 sm:gap-2 md:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-16 xs:h-16 sm:h-20 md:h-24 bg-slate-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 xs:gap-1 sm:gap-2 md:gap-4">
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
