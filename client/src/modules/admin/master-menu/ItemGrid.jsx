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
    <section className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-[#F35C2B] rounded-full" />
          <h3 className="text-[11px] sm:text-[13px] font-[900] uppercase tracking-[0.2em] text-slate-400">
            {title}
          </h3>
        </div>

        {canAddItem && hasItems && (
          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F35C2B] startup-shadow text-[10px] font-black text-white hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            ADD ITEM
          </button>
        )}
      </div>

      {/* EMPTY STATE - Apple Glass Style */}
      {!hasItems && (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 text-center startup-shadow">
          <div className="w-16 h-16 bg-white rounded-2xl startup-shadow mx-auto flex items-center justify-center mb-4">
            <LayoutGrid size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">
            No Items in Registry
          </p>
          <p className="text-xs text-slate-500 max-w-[200px] mx-auto leading-relaxed">
            {isAllSection
              ? "This view aggregates all items from the parent category."
              : "Kickstart your menu by drafting your first entry."}
          </p>

          {canAddItem && (
            <button
              onClick={onAddItem}
              className="mt-6 px-7 py-3 bg-[#F35C2B] text-white rounded-full text-[11px] font-black tracking-widest uppercase hover:brightness-105 active:scale-95 transition-all startup-shadow"
            >
              + Create Entry
            </button>
          )}
        </div>
      )}

      {/* GRID LAYOUT - Precision Spacing */}
      {hasItems && (
        <div className="space-y-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {items.map((item) => (
              <ItemCard
                key={item._id || item.id}
                item={item}
                refresh={refresh}
                onDelete={() => onDeleteItem(item.id || item._id)}
              />
            ))}

            {/* THE "NEW ITEM" SQUIRCLE PLACEHOLDER */}
            {canAddItem && (
              <button
                onClick={onAddItem}
                className="group relative aspect-square rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-[#F35C2B] hover:text-[#F35C2B] hover:bg-orange-50/40 transition-all duration-500 active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-500">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  New Item
                </span>
              </button>
            )}
          </div>

          {/* MOBILE QUICK ACTION */}
          {canAddItem && (
            <button
              onClick={onAddItem}
              className="sm:hidden w-full py-4 bg-white startup-shadow text-black rounded-[20px] text-xs font-black tracking-[0.2em] uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} className="text-[#F35C2B]" />
              Add New Entry
            </button>
          )}
        </div>
      )}
    </section>
  );
}
