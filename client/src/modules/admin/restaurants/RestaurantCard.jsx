import { FaUsers, FaMapMarkerAlt, FaChevronRight } from "react-icons/fa";

export default function RestaurantCard({ data, onManageManagers }) {
  // 🛡️ HARD SAFETY
  if (!data) {
    return (
      <div className="bg-white border rounded-xl p-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4 hover:shadow-md transition flex flex-col justify-between">
      {/* TOP */}
      <div className="space-y-1">
        <h3 className="font-semibold text-lg text-[#1A1C1E] truncate">
          {data.name}
        </h3>

        {data.address?.city && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaMapMarkerAlt className="text-xs shrink-0" />
            <span className="truncate">
              {data.address.city}, {data.address.state}
            </span>
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t">
        <span className="text-xs text-gray-500 truncate">
          {data.phone || "No phone added"}
        </span>

        <button
          onClick={onManageManagers}
          className="flex items-center gap-2 text-sm font-semibold text-[#00684A] hover:text-[#00553D]"
        >
          <FaUsers />
          Managers
          <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
