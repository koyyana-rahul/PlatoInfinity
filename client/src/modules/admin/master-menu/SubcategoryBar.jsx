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
    /* OUTER TRACK - Apple Control Center Style */
    <div className="bg-white rounded-3xl p-1.5 startup-shadow">
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide items-center touch-pan-x scroll-smooth px-1 py-1"
        role="tablist"
      >
        {/* ================= ALL SECTION ================= */}
        <button
          type="button"
          role="tab"
          aria-selected={activeSubcategoryId === null}
          onClick={() => onSelect(null)}
          className={clsx(
            "flex-shrink-0 h-10 rounded-full text-[10px] font-[800] uppercase tracking-widest transition-all duration-300",
            activeSubcategoryId === null
              ? "bg-[#F35C2B] text-white startup-shadow px-6 min-w-[70px]"
              : "text-slate-500 hover:text-black active:scale-95 px-4 min-w-[50px]",
          )}
        >
          All
        </button>

        {/* ================= SUBCATEGORIES ================= */}
        {subcategories.map((sub) => {
          const isActive = sub.id === activeSubcategoryId;

          return (
            <div key={sub.id} className="relative flex-shrink-0">
              {/* THE PILL BUTTON 
                  We use PX-12 and MIN-W-140 only when active to reveal icons.
                  The transition-all duration-500 creates the 'slide out' expansion effect.
              */}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(sub.id)}
                className={clsx(
                  "relative flex items-center justify-center rounded-full text-[10px] font-[800] uppercase tracking-widest transition-all duration-300 h-10",
                  isActive
                    ? "bg-[#F35C2B] text-white startup-shadow px-14 min-w-[150px] z-10"
                    : "bg-transparent text-slate-500 hover:text-black active:scale-95 px-4 min-w-[70px] max-w-[130px]",
                )}
              >
                <span className="truncate w-full text-center">{sub.name}</span>
              </button>

              {/* ================= ADMIN CONTROLS ================= 
                  Triggered strictly by the 'isActive' state. 
                  Removed 'lg:group-hover' to match mobile behavior on desktop.
              */}
              {(onEdit || onDelete) && (
                <div
                  className={clsx(
                    "absolute inset-0 flex items-center justify-between px-1.5 transition-all duration-500 pointer-events-none z-20",
                    isActive
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-75 blur-sm",
                  )}
                >
                  {/* EDIT ACTION */}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sub);
                      }}
                      className="w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-500 active:scale-125 transition-all border border-black/[0.05]"
                    >
                      <Pencil size={11} strokeWidth={3} />
                    </button>
                  )}

                  {/* DELETE ACTION */}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sub.id);
                      }}
                      className="w-7 h-7 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-125 transition-all border border-black/[0.05]"
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
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 ml-1 bg-[#F35C2B] rounded-full text-white startup-shadow hover:brightness-105 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}
