import { useState } from "react";
import { FiChevronDown, FiUser, FiCoffee, FiDollarSign } from "react-icons/fi";
import StaffTable from "./StaffTable";
import clsx from "clsx";

const ROLE_META = {
  WAITER: { label: "Waiters", icon: FiUser },
  CHEF: { label: "Kitchen Staff", icon: FiCoffee },
  CASHIER: { label: "Cashiers", icon: FiDollarSign },
};

export default function StaffAccordion({
  grouped,
  restaurantId,
  onUpdateStaff,
  onToggleStaff,
}) {
  const [open, setOpen] = useState("WAITER");

  return (
    <div className="space-y-3">
      {Object.entries(ROLE_META).map(([role, meta]) => {
        const Icon = meta.icon;
        const staffList = grouped[role] || [];
        const isOpen = open === role;
        const activeCount = staffList.filter((s) => s.isActive).length;

        return (
          <div
            key={role}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : role)}
              className="w-full flex items-center justify-between px-4 sm:px-5 py-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeCount} active • {staffList.length} total
                  </p>
                </div>
              </div>

              <FiChevronDown
                size={18}
                className={clsx(
                  "text-gray-400 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <StaffTable
                    staff={staffList}
                    restaurantId={restaurantId}
                    onUpdateStaff={onUpdateStaff}
                    onToggleStaff={onToggleStaff}
                  />

                  {staffList.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-500">
                      No staff in this role.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
