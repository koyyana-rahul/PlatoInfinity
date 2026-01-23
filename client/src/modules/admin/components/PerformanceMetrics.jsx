import React from "react";
import { FiAward, FiTrendingDown, FiUsers, FiClock } from "react-icons/fi";

/**
 * Staff Performance Card
 */
const StaffCard = ({ staff, metric }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-900">{staff.name}</p>
          <p className="text-xs text-slate-600">{staff.role}</p>
          {staff.branch && (
            <p className="text-xs text-slate-500 mt-1 font-medium">
              🏪 {staff.branch}
            </p>
          )}
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {staff.initials}
        </div>
      </div>

      <div className="bg-slate-50 rounded p-3">
        <p className="text-xs text-slate-600 mb-1">{metric.label}</p>
        <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
      </div>

      {metric.trend && (
        <p
          className={`text-xs mt-2 font-semibold ${metric.trend > 0 ? "text-green-600" : "text-red-600"}`}
        >
          {metric.trend > 0 ? "↑" : "↓"} {Math.abs(metric.trend)}% vs last
          period
        </p>
      )}
    </div>
  );
};

/**
 * Performance Metrics Component
 */
export const PerformanceMetrics = ({ staffData = [], loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Mock data if no staffData
  const mockStaff = [
    {
      id: 1,
      name: "Chef Rohit",
      role: "CHEF",
      initials: "CR",
      metric: { label: "Orders Prepared", value: 24, trend: 12 },
    },
    {
      id: 2,
      name: "Waiter Priya",
      role: "WAITER",
      initials: "WP",
      metric: { label: "Orders Served", value: 32, trend: 8 },
    },
    {
      id: 3,
      name: "Cashier Amit",
      role: "CASHIER",
      initials: "CA",
      metric: { label: "Transactions", value: 18, trend: -3 },
    },
    {
      id: 4,
      name: "Manager Sneha",
      role: "MANAGER",
      initials: "MS",
      metric: { label: "Avg Rating", value: "4.8", trend: 5 },
    },
  ];

  const displayStaff =
    staffData && staffData.length > 0 ? staffData : mockStaff;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FiAward className="text-yellow-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">Top Performance</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} metric={staff.metric} />
        ))}
      </div>
    </div>
  );
};

/**
 * Operational Metrics Card
 */
export const OperationalMetrics = ({ metrics, loading }) => {
  if (loading) {
    return <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />;
  }

  const defaultMetrics = {
    avgPreparationTime: "18 min",
    avgDeliveryTime: "12 min",
    customerSatisfaction: "4.7/5",
    foodWastePercentage: "2.3%",
  };

  const displayMetrics = metrics || defaultMetrics;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiClock className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">
          Operational Metrics
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-slate-600 mb-1">Avg Prep Time</p>
          <p className="text-2xl font-bold text-slate-900">
            {displayMetrics.avgPreparationTime}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Avg Delivery</p>
          <p className="text-2xl font-bold text-slate-900">
            {displayMetrics.avgDeliveryTime}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Satisfaction</p>
          <p className="text-2xl font-bold text-green-600">
            {displayMetrics.customerSatisfaction}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Food Waste</p>
          <p className="text-2xl font-bold text-orange-600">
            {displayMetrics.foodWastePercentage}
          </p>
        </div>
      </div>
    </div>
  );
};
