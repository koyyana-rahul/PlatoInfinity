import clsx from "clsx";
import {
  FiMapPin,
  FiPhone,
  FiUsers,
  FiTrash2,
  FiEye,
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
      <div className="bg-white rounded-3xl p-5 animate-pulse space-y-3 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]">
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
        "bg-white rounded-3xl transition-all duration-300 overflow-hidden shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)] hover:scale-[1.02]",
        isActive
          ? ""
          : "opacity-75",
      )}
    >
      {/* HEADER SECTION */}
      <div
        className={`px-4 sm:px-5 py-3 sm:py-4 border-b transition-colors ${
          isActive
            ? "bg-[#F35C2B]/[0.06] border-[#F35C2B]/20"
            : "bg-slate-50/60 border-slate-100"
        }`}
      >
        <div className="flex items-start gap-3 justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate line-clamp-2 group-hover:text-[#F35C2B] transition">
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap",
                  isActive
                    ? "bg-[#F35C2B]/15 text-[#F35C2B]"
                    : "bg-red-100 text-red-700",
                )}
              >
                <span
                  className={`w-1 h-1 rounded-full ${isActive ? "bg-[#F35C2B]" : "bg-red-600"}`}
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
              className="flex-shrink-0 text-[#F35C2B] mt-0.5"
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
            ? "bg-slate-50/50 border-[#F35C2B]/15"
            : "bg-slate-50/30 border-slate-100"
        } flex items-center gap-2 sm:gap-3 flex-wrap`}
      >
        <button
          onClick={onView}
          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-[11px] sm:text-xs transition-all active:scale-95"
          title="View details"
        >
          <FiEye size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">View</span>
        </button>

        <button
          onClick={onManageManagers}
          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 bg-[#F35C2B] hover:brightness-95 text-white rounded-2xl font-semibold text-[11px] sm:text-xs transition-all active:scale-95"
          title="Manage managers"
        >
          <FiUsers size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Managers</span>
        </button>

        <button
          onClick={onDelete}
          className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl font-semibold text-[11px] sm:text-xs transition-all active:scale-95"
          title="Delete restaurant"
        >
          <FiTrash2 size={12} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}
