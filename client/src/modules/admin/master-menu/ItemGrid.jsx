import ItemCard from "./ItemCard";
import { PlusCircle, Info } from "lucide-react";

export default function ItemGrid({
  title,
  items = [],
  refresh,
  onAddItem,
  isAllSection = false,
}) {
  const canAddItem = !isAllSection;
  const hasItems = items.length > 0;

  return (
    <section className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-black uppercase text-gray-800">
          {title}
        </h3>

        {canAddItem && (
          <button
            onClick={onAddItem}
            className="hidden sm:flex items-center gap-1 text-xs font-black text-red-600"
          >
            <PlusCircle size={16} />
            ADD ITEM
          </button>
        )}
      </div>

      {/* EMPTY */}
      {!hasItems && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <Info size={20} className="mx-auto text-blue-600 mb-2" />
          <p className="text-sm font-bold text-blue-700">No items found</p>
          <p className="text-xs text-blue-600">
            {isAllSection
              ? "This section shows all items in this category"
              : "Start by adding your first menu item"}
          </p>

          {canAddItem && (
            <button
              onClick={onAddItem}
              className="mt-3 px-5 py-2 bg-black text-white rounded-xl text-xs font-black"
            >
              + Add Item
            </button>
          )}
        </div>
      )}

      {/* GRID */}
      {hasItems && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item._id || item.id}
                item={item}
                refresh={refresh}
              />
            ))}

            {canAddItem && (
              <button
                onClick={onAddItem}
                className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 min-h-[180px] text-gray-400 hover:text-red-600"
              >
                <PlusCircle size={22} />
                <span className="text-xs font-black uppercase">New Item</span>
              </button>
            )}
          </div>

          {canAddItem && (
            <button
              onClick={onAddItem}
              className="sm:hidden w-full py-3 bg-black text-white rounded-xl font-black"
            >
              + Add Item
            </button>
          )}
        </>
      )}
    </section>
  );
}
