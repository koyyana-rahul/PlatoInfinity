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
    return <div className="h-11 bg-slate-100 rounded-2xl animate-pulse w-48 startup-shadow" />;
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
        className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 bg-white startup-shadow focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
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
