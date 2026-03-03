import { FiX, FiAlertCircle, FiShield } from "react-icons/fi";
import clsx from "clsx";

export default function RemoveStaffModal({
  staff,
  loading,
  onClose,
  onConfirm,
}) {
  if (!staff) return null;
  const isActive = staff.isActive;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <FiX size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div
            className={clsx(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              isActive
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600",
            )}
          >
            {isActive ? <FiAlertCircle size={22} /> : <FiShield size={22} />}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isActive ? "Deactivate Staff" : "Activate Staff"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You are changing access for{" "}
              <span className="font-semibold">{staff.name}</span>.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase">Staff Code</span>
            <span className="text-sm font-semibold text-gray-900">
              {staff.staffCode}
            </span>
          </div>

          <div
            className={clsx(
              "rounded-lg p-3 border text-sm",
              isActive
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700",
            )}
          >
            {isActive
              ? "Staff login will be blocked until reactivated."
              : "Staff login will be restored and they can access the system again."}
          </div>

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "flex-1 h-10 text-white rounded-lg text-sm font-semibold disabled:opacity-60",
                isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700",
              )}
            >
              {loading ? "Updating..." : isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
