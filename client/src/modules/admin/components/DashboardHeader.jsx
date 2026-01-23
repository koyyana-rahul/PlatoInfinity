import React from "react";

/**
 * Dashboard Header Component
 * Displays title, greeting, and time range selector
 */
export const DashboardHeader = ({ userName, timeRange, onTimeRangeChange }) => {
  const ranges = ["today", "week", "month"];

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Welcome back, {userName || "Admin"}
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition ${
              timeRange === range
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Live Status */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Live
        </span>
      </div>
    </div>
  );
};
