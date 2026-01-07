import BranchItemCard from "./BranchItemCard";

export default function BranchItemGrid({
  items = [],
  loading,
  refresh,
  isAllSection,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-blue-50 border rounded-xl p-6 text-center">
        <p className="text-sm font-semibold text-blue-700">
          No items available
        </p>
        <p className="text-xs text-blue-600">Import items from Master Menu</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <BranchItemCard key={item._id} item={item} refresh={refresh} />
      ))}
    </div>
  );
}
