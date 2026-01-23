import React from "react";
import {
  FiTrendingUp,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";

/**
 * KPI Card Component - Shows key performance indicators
 */
const KPICard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = "blue",
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="h-4 bg-slate-100 rounded animate-pulse mb-4 w-32" />
        <div className="h-8 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {unit && <p className="text-sm text-slate-500">{unit}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <FiTrendingUp
                className={trend > 0 ? "text-green-500" : "text-red-500"}
                size={14}
              />
              <span
                className={`text-xs font-semibold ${
                  trend > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

/**
 * KPI Dashboard Grid
 */
export const KPIDashboard = ({ stats, loading }) => {
  if (!stats) {
    return <div className="text-slate-500">No data available</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Revenue */}
      <KPICard
        title="Total Revenue"
        value={`₹${(stats.totalSales || 0).toLocaleString("en-IN")}`}
        color="green"
        icon={FiTrendingUp}
        trend={stats.revenueTrend || 12}
        loading={loading}
      />

      {/* Orders Today */}
      <KPICard
        title="Orders Today"
        value={stats.ordersToday || 0}
        unit="orders"
        color="blue"
        icon={FiCheckCircle}
        trend={stats.ordersTrend || 8}
        loading={loading}
      />

      {/* Avg Order Value */}
      <KPICard
        title="Avg Order Value"
        value={`₹${(stats.averageOrderValue || 0).toLocaleString("en-IN")}`}
        color="orange"
        icon={FiUsers}
        trend={stats.avgTrend || 5}
        loading={loading}
      />

      {/* Completion Rate */}
      <KPICard
        title="Completion Rate"
        value={`${(stats.completionRate || 0).toFixed(1)}%`}
        color="green"
        icon={FiCheckCircle}
        trend={stats.completionTrend || 3}
        loading={loading}
      />

      {/* Active Tables */}
      <KPICard
        title="Active Tables"
        value={stats.activeTables || 0}
        unit="tables"
        color="purple"
        icon={FiClock}
        loading={loading}
      />
    </div>
  );
};
