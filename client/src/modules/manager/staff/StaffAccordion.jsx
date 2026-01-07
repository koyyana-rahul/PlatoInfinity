// src/modules/manager/staff/StaffAccordion.jsx
import { useState } from "react";
import { FiChevronDown, FiUser, FiCoffee, FiDollarSign } from "react-icons/fi";
import StaffTable from "./StaffTable";

/* ================= ROLE CONFIG ================= */
const ROLE_META = {
  WAITER: {
    label: "Waiters",
    icon: FiUser,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  CHEF: {
    label: "Chefs",
    icon: FiCoffee,
    color: "text-orange-700",
    bg: "bg-orange-50",
  },
  CASHIER: {
    label: "Cashiers",
    icon: FiDollarSign,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
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
    <div className="space-y-4">
      {Object.entries(ROLE_META).map(([role, meta]) => {
        const Icon = meta.icon;
        const staffList = grouped[role] || [];
        const isOpen = open === role;

        const activeCount = staffList.filter((s) => s.isActive).length;

        return (
          <div
            key={role}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* ================= HEADER ================= */}
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : role)}
              className="
                w-full flex items-center justify-between
                px-4 sm:px-6 py-4
                hover:bg-gray-50 transition
              "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`${meta.bg} ${meta.color} p-2 rounded-lg shrink-0`}
                >
                  <Icon size={18} />
                </div>

                <div className="text-left min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {meta.label}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {activeCount} active • {staffList.length} total
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <FiChevronDown
                size={18}
                className={`
                  text-gray-500 transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* ================= BODY ================= */}
            <div
              className={`
                grid transition-all duration-300 ease-in-out
                ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
              `}
            >
              <div className="overflow-hidden">
                {isOpen && (
                  <div className="border-t px-2 sm:px-4 py-4 bg-gray-50">
                    <StaffTable
                      staff={staffList}
                      restaurantId={restaurantId}
                      onUpdateStaff={onUpdateStaff}
                      onToggleStaff={onToggleStaff}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
