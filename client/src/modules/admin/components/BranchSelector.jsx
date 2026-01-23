import React from "react";
import { FiMapPin } from "react-icons/fi";

/**
 * Branch Selector Component
 * Allows filtering orders by branch/restaurant
 */
export const BranchSelector = ({
  branches,
  selectedBranch,
  onBranchChange,
  loading,
}) => {
  if (loading) {
    return <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-48" />;
  }

  if (!branches || branches.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <FiMapPin className="text-slate-600" size={18} />
      <select
        value={selectedBranch || "all"}
        onChange={(e) =>
          onBranchChange(e.target.value === "all" ? null : e.target.value)
        }
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="all">All Branches</option>
        {branches.map((branch) => (
          <option key={branch._id} value={branch._id}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
};
