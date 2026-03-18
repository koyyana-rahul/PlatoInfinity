import React from "react";
import { FiMapPin } from "react-icons/fi";
import Dropdown from "../../../components/ui/DropDown";

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
    return (
      <div className="h-11 bg-slate-100 rounded-xl animate-pulse w-full sm:w-72 startup-shadow" />
    );
  }

  if (!branches || branches.length === 0) {
    return null;
  }

  const branchOptions = [
    { value: "all", label: "All Branches" },
    ...branches.map((branch) => ({
      value: branch._id,
      label: branch.name,
    })),
  ];

  return (
    <div className="w-full sm:w-72 max-w-full">
      <div className="flex items-center gap-2 bg-white rounded-xl startup-shadow px-3 py-1.5 border border-slate-100">
        <FiMapPin className="text-[#FC8019] shrink-0" size={16} />
        <div className="min-w-0 flex-1">
          <Dropdown
            value={selectedBranch || "all"}
            onChange={(value) => onBranchChange(value === "all" ? null : value)}
            options={branchOptions}
            placeholder="Select branch"
          />
        </div>
      </div>
    </div>
  );
};
