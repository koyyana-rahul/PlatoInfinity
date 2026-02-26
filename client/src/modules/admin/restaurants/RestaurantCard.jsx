import clsx from "clsx";
import { FiMapPin, FiPhone, FiUsers, FiTrash2, FiEye } from "react-icons/fi";

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
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 animate-pulse space-y-3 shadow-sm">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </div>
    );
  }

  const isActive = !data.isArchived;

  return (
    <div
      className={clsx(
        "group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden hover:shadow-md active:scale-[0.99]",
        isActive
          ? "border-gray-200 shadow-sm hover:border-[#FC8019]/30"
          : "border-gray-200 opacity-60",
      )}
    >
      {/* HEADER SECTION */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 group-hover:text-[#FC8019] transition-colors break-words line-clamp-2">
              {data.name}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                  isActive
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200",
                )}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="text-2xl shrink-0">🏪</div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3">
        {/* Address */}
        {data.addressText && (
          <div className="flex gap-2.5 text-sm">
            <FiMapPin
              className="flex-shrink-0 text-gray-400 mt-0.5"
              size={16}
            />
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 leading-relaxed break-words line-clamp-3">
                {data.addressText}
              </p>
              {data.meta?.address?.pincode && (
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  PIN: {data.meta.address.pincode}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {data.phone && (
          <div className="flex gap-2.5 items-center text-sm">
            <FiPhone className="text-gray-400 flex-shrink-0" size={16} />
            <a
              href={`tel:${data.phone}`}
              className="text-gray-700 hover:text-[#FC8019] transition-colors font-medium break-all"
            >
              {data.phone}
            </a>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-all border border-gray-200 active:scale-[0.98]"
            title="View details"
          >
            <FiEye size={14} />
            <span>View</span>
          </button>

          <button
            onClick={onManageManagers}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-md text-white rounded-lg font-semibold text-xs transition-all active:scale-[0.98]"
            title="Manage managers"
          >
            <FiUsers size={14} />
            <span>Managers</span>
          </button>
        </div>

        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-600 rounded-lg font-medium text-xs transition-all border border-red-200 active:scale-[0.98]"
          title="Delete restaurant"
        >
          <FiTrash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
