import React from "react";
import { FiPieChart } from "react-icons/fi";

/**
 * Revenue Category Item
 */
const RevenueItem = ({ label, amount, percentage, color }) => {
  const colorClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    orange: "bg-orange-100",
    purple: "bg-purple-100",
    pink: "bg-pink-100",
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-slate-900">₹{amount}</p>
        <p className="text-xs text-slate-600">{percentage}%</p>
      </div>
    </div>
  );
};

/**
 * Revenue Breakdown Component
 */
export const RevenueBreakdown = ({ breakdown, loading }) => {
  if (loading) {
    return <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />;
  }

  // Mock data if not provided
  const mockBreakdown = [
    {
      label: "Food Orders",
      amount: "45,200",
      percentage: 62,
      color: "green",
    },
    {
      label: "Beverages",
      amount: "18,500",
      percentage: 25,
      color: "blue",
    },
    {
      label: "Add-ons",
      amount: "7,300",
      percentage: 10,
      color: "orange",
    },
    {
      label: "Delivery Charges",
      amount: "2,800",
      percentage: 3,
      color: "purple",
    },
  ];

  const displayBreakdown = breakdown || mockBreakdown;
  const total = displayBreakdown.reduce(
    (sum, item) => sum + parseInt(item.amount.replace(/,/g, "")),
    0,
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <FiPieChart className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">Revenue Breakdown</h3>
      </div>

      <div className="space-y-3">
        {displayBreakdown.map((item, idx) => (
          <RevenueItem
            key={idx}
            label={item.label}
            amount={item.amount}
            percentage={item.percentage}
            color={item.color}
          />
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-slate-600">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
};
