// src/modules/manager/staff/StaffAccordion.jsx
import { useState } from "react";
import {
  FiChevronDown,
  FiUser,
  FiCoffee,
  FiDollarSign,
  FiActivity,
} from "react-icons/fi";
import StaffTable from "./StaffTable";
import clsx from "clsx";

/* ================= ROLE CONFIG ================= */
const ROLE_META = {
  WAITER: {
    label: "Waiters",
    icon: FiUser,
    color: "text-blue-600",
    bg: "bg-blue-50/50",
    border: "border-blue-100",
  },
  CHEF: {
    label: "Kitchen Staff",
    icon: FiCoffee,
    color: "text-orange-600",
    bg: "bg-orange-50/50",
    border: "border-orange-100",
  },
  CASHIER: {
    label: "Finance & Cash",
    icon: FiDollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50/50",
    border: "border-emerald-100",
  },
};

export default function StaffAccordion({
  grouped,
  restaurantId,
  onUpdateStaff,
  onToggleStaff,
}) {
  const [open, setOpen] = useState("WAITER");

  return (
    <div className="space-y-3 sm:space-y-4 max-w-[1000px] mx-auto">
      {Object.entries(ROLE_META).map(([role, meta]) => {
        const Icon = meta.icon;
        const staffList = grouped[role] || [];
        const isOpen = open === role;
        const activeCount = staffList.filter((s) => s.isActive).length;

        return (
          <div
            key={role}
            className={clsx(
              "group bg-white border rounded-[24px] sm:rounded-[32px] overflow-hidden transition-all duration-500",
              isOpen
                ? "border-slate-200 shadow-xl shadow-slate-200/50"
                : "border-slate-100 hover:border-slate-200 hover:shadow-lg",
            )}
          >
            {/* ================= HEADER ================= */}
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : role)}
              className="w-full flex items-center justify-between px-5 sm:px-8 py-5 transition-colors relative"
            >
              <div className="flex items-center gap-4 min-w-0 z-10">
                {/* ICON SQUIRCLE */}
                <div
                  className={clsx(
                    "p-3 rounded-2xl shrink-0 transition-transform duration-500 group-hover:scale-110",
                    meta.bg,
                    meta.color,
                    meta.border,
                    "border",
                  )}
                >
                  <Icon size={22} />
                </div>

                <div className="text-left min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                    {meta.label}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <FiActivity size={10} className="animate-pulse" />{" "}
                      {activeCount} Online
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      • {staffList.length} Total
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT ACTION */}
              <div className="flex items-center gap-4">
                <FiChevronDown
                  size={20}
                  className={clsx(
                    "text-slate-300 transition-all duration-500",
                    isOpen
                      ? "rotate-180 text-slate-900"
                      : "group-hover:text-slate-400",
                  )}
                />
              </div>
            </button>

            {/* ================= BODY ================= */}
            <div
              className={clsx(
                "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-50 bg-slate-50/30 p-2 sm:p-6">
                  {/* Container for the table to ensure horizontal scroll on small screens */}
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                    <StaffTable
                      staff={staffList}
                      restaurantId={restaurantId}
                      onUpdateStaff={onUpdateStaff}
                      onToggleStaff={onToggleStaff}
                    />

                    {staffList.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                          No staff registered in this category
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
