import clsx from "clsx";
import {
  FiMapPin,
  FiPhone,
  FiUsers,
  FiTrash2,
  FiEye,
  FiMoreVertical,
} from "react-icons/fi";

/**
 * Restaurant Card Component - Professional design with responsive actions
 */
export default function RestaurantCard({
  data,
  onView,
  onManageManagers,
  onDelete,
}) {
  // Loading skeleton
  if (!data) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-5 animate-pulse space-y-3">
        <div className="h-6 w-32 bg-slate-200 rounded-lg" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-4 w-28 bg-slate-100 rounded" />
      </div>
    );
  }

  const isActive = !data.isArchived;

  return (
    <div
      className={clsx(
        "group relative animate-in fade-in zoom-in-95 duration-500",
        "bg-white rounded-lg sm:rounded-xl border transition-all duration-300 overflow-hidden",
        isActive
          ? "border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10"
          : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md opacity-75",
      )}
    >
      {/* HEADER SECTION */}
      <div
        className={`px-4 sm:px-5 py-3 sm:py-4 border-b transition-colors ${
          isActive
            ? "bg-emerald-50/30 border-emerald-100/50"
            : "bg-slate-50/30 border-slate-100"
        }`}
      >
        <div className="flex items-start gap-3 justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate line-clamp-2 group-hover:text-emerald-600 transition">
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap",
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700",
                )}
              >
                <span
                  className={`w-1 h-1 rounded-full ${isActive ? "bg-emerald-600" : "bg-red-600"}`}
                />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl shrink-0">🏪</div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-2.5">
        {/* Address */}
        {data.addressText && (
          <div className="flex gap-2 text-xs sm:text-sm">
            <FiMapPin
              className="flex-shrink-0 text-emerald-600 mt-0.5"
              size={14}
              strokeWidth={2.5}
            />
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 font-medium line-clamp-2">
                {data.addressText}
              </p>
              {data.meta?.address?.pincode && (
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-semibold">
                  📮 {data.meta.address.pincode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {data.phone && (
          <div className="flex gap-2 items-center text-xs sm:text-sm">
            <FiPhone
              className="text-blue-600 flex-shrink-0 sm:w-4 sm:h-4"
              size={14}
              strokeWidth={2.5}
            />
            <a
              href={`tel:${data.phone}`}
              className="text-slate-700 hover:text-blue-600 transition font-semibold truncate"
            >
              {data.phone}
            </a>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div
        className={`px-4 sm:px-5 py-3 sm:py-4 border-t transition-colors ${
          isActive
            ? "bg-slate-50/50 border-emerald-100/50"
            : "bg-slate-50/30 border-slate-100"
        } flex items-center gap-2 sm:gap-3 flex-wrap`}
      >
        <button
          onClick={onView}
          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 rounded-lg font-semibold text-[11px] sm:text-xs transition-all active:scale-95"
          title="View details"
        >
          <FiEye size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">View</span>
        </button>

        <button
          onClick={onManageManagers}
          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 hover:text-emerald-800 rounded-lg font-semibold text-[11px] sm:text-xs transition-all active:scale-95"
          title="Manage managers"
        >
          <FiUsers size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Managers</span>
        </button>

        <button
          onClick={onDelete}
          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 rounded-lg font-semibold text-[11px] sm:text-xs transition-all active:scale-95"
          title="Delete restaurant"
        >
          <FiTrash2 size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}
