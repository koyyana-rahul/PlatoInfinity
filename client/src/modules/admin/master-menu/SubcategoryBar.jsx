import { Pencil, Trash2, Plus } from "lucide-react";
import clsx from "clsx";

export default function SubcategoryBar({
  subcategories = [],
  activeSubcategoryId = null,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    /* OUTER TRACK */
    <div className="bg-[#787880]/[0.12] border border-black/[0.03] rounded-[22px] p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
      <div
        className="flex gap-1 overflow-x-auto scrollbar-hide items-center touch-pan-x scroll-smooth px-1 py-0.5"
        role="tablist"
      >
        {/* ================= ALL SECTION ================= */}
        <button
          type="button"
          role="tab"
          onClick={() => onSelect(null)}
          className={clsx(
            "flex-shrink-0 h-9 rounded-[18px] text-[10px] font-[800] uppercase tracking-widest transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            activeSubcategoryId === null
              ? "bg-white text-black shadow-sm ring-1 ring-black/[0.04] px-6 min-w-[70px]"
              : "text-slate-500 hover:text-black active:scale-95 px-3 min-w-[50px]",
          )}
        >
          All
        </button>

        {/* ================= SUBCATEGORIES ================= */}
        {subcategories.map((sub) => {
          const isActive = sub.id === activeSubcategoryId;

          return (
            <div key={sub.id} className="relative group flex-shrink-0">
              {/* THE PILL BUTTON */}
              <button
                type="button"
                role="tab"
                onClick={() => onSelect(sub.id)}
                className={clsx(
                  "relative flex items-center justify-center rounded-[18px] text-[10px] font-[800] uppercase tracking-widest transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] h-9",
                  /* EXPANSION LOGIC: 
                     Inactive: Very tight (px-2). 
                     Active: Wide (px-12) to make room for the Pencil/Trash icons on the edges.
                  */
                  isActive
                    ? "bg-white text-black shadow-md ring-1 ring-black/[0.04] px-12 min-w-[140px] z-10"
                    : "text-slate-500 hover:text-black active:scale-95 px-2 min-w-[60px] max-w-[120px]",
                )}
              >
                <span className="truncate w-full text-center">{sub.name}</span>
              </button>

              {/* ================= ADMIN ICONS (The Pencil and Trash) ================= */}
              {(onEdit || onDelete) && (
                <div
                  className={clsx(
                    "absolute inset-0 flex items-center justify-between px-1 transition-all duration-500 pointer-events-none z-20",
                    /* Only show icons when active OR on desktop hover */
                    isActive
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-50 lg:group-hover:opacity-100 lg:group-hover:scale-100 lg:group-hover:pointer-events-auto",
                  )}
                >
                  {/* EDIT ICON (Appears on the left side of the expanded pill) */}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sub);
                      }}
                      className="w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-500 active:scale-125 transition-all border border-black/[0.05]"
                      title="Edit Section"
                    >
                      <Pencil size={11} strokeWidth={3} />
                    </button>
                  )}

                  {/* DELETE ICON (Appears on the right side of the expanded pill) */}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sub.id);
                      }}
                      className="w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-125 transition-all border border-black/[0.05]"
                      title="Delete Section"
                    >
                      <Trash2 size={11} strokeWidth={3} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ================= ADD BUTTON ================= */}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 ml-1 bg-white/40 rounded-full text-slate-500 hover:text-emerald-600 hover:bg-white transition-all active:scale-90 border border-black/[0.03]"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}
