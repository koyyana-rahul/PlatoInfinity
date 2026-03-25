import ItemCard from "./ItemCard";
import { Plus, LayoutGrid, Info } from "lucide-react";
import clsx from "clsx";

export default function ItemGrid({
  title,
  items = [],
  refresh,
  onAddItem,
  onDeleteItem,
  isAllSection = false,
}) {
  const canAddItem = !isAllSection;
  const hasItems = items.length > 0;

  return (
    <section className="space-y-5">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-[#FC8019] rounded-full" />
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>

        {canAddItem && hasItems && (
          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FC8019] to-[#FF6B35] shadow-md text-xs font-semibold text-white hover:shadow-lg active:scale-[0.98] transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Item
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {!hasItems && (
        <div className="bg-white rounded-xl p-8 sm:p-10 text-center border border-gray-200 shadow-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-xl shadow-sm mx-auto flex items-center justify-center mb-4 border border-gray-200">
            <LayoutGrid size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            No Items Yet
          </p>
          <p className="text-xs text-gray-600 max-w-[250px] mx-auto leading-relaxed">
            {isAllSection
              ? "This view shows all items from the category."
              : "Create your first menu item to get started."}
          </p>

          {canAddItem && (
            <button
              onClick={onAddItem}
              className="mt-5 px-6 py-2.5 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white rounded-lg text-xs font-semibold tracking-wide hover:shadow-lg active:scale-[0.98] transition-all shadow-md"
            >
              + Create Item
            </button>
          )}
        </div>
      )}

      {/* GRID LAYOUT */}
      {hasItems && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {items.map((item) => (
              <ItemCard
                key={item._id || item.id}
                item={item}
                refresh={refresh}
                onDelete={onDeleteItem ? () => onDeleteItem(item) : undefined}
              />
            ))}

            {/* THE "NEW ITEM" PLACEHOLDER */}
            {canAddItem && (
              <button
                onClick={onAddItem}
                className="group relative aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-[#FC8019] hover:text-[#FC8019] hover:bg-orange-50/30 transition-all active:scale-[0.98]"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-100 group-hover:scale-110 transition-all">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold">New Item</span>
              </button>
            )}
          </div>

          {/* MOBILE QUICK ACTION */}
          {canAddItem && (
            <button
              onClick={onAddItem}
              className="sm:hidden w-full py-3.5 bg-white border border-gray-200 shadow-sm text-gray-900 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={2.5} className="text-[#FC8019]" />
              Add New Item
            </button>
          )}
        </div>
      )}
    </section>
  );
}
