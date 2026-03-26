import BranchItemCard from "./BranchItemCard";
import { PackageOpen } from "lucide-react";

export default function BranchItemGrid({
  items = [],
  loading,
  refresh,
  title,
  onEdit,
  onStock,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  if (loading) {
    return (
      <div className="space-y-2.5 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          {title || "Items"}
        </h3>
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2 xs:space-y-3">
              <div className="aspect-square bg-gray-100 rounded-xl" />
              <div className="space-y-1.5 xs:space-y-2 px-0.5 xs:px-1">
                <div className="h-3 xs:h-4 w-2/3 bg-gray-100 rounded-lg" />
                <div className="h-2 xs:h-3 w-1/2 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!safeItems.length) {
    return (
      <div className="space-y-2.5 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          {title || "Items"}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 xs:py-12 px-3 xs:px-6 text-center bg-white border border-dashed border-gray-300 rounded-xl">
          <div className="w-10 h-10 xs:w-16 xs:h-16 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-2 xs:mb-4">
            <PackageOpen size={20} xs:size={30} strokeWidth={1.8} />
          </div>
          <h3 className="text-base xs:text-lg font-semibold text-gray-900">
            No items found
          </h3>
          <p className="mt-0.5 xs:mt-1 text-xs xs:text-sm text-gray-500">
            Import or sync with master menu to add items.
          </p>
          <button
            onClick={refresh}
            className="mt-3 xs:mt-5 px-3 xs:px-4 py-1.5 xs:py-2 bg-orange-500 text-white rounded-lg text-xs xs:text-sm font-semibold hover:bg-orange-600 transition-all"
          >
            Refresh Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-4">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900">
        {title || "Items"}
      </h3>
      <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-4">
        {safeItems.map((item) => (
          <BranchItemCard
            key={item._id}
            item={item}
            refresh={refresh}
            onEdit={onEdit}
            onStock={onStock}
          />
        ))}
      </div>
    </div>
  );
}
