import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";

export default function CategoryBar({
  categories = [],
  activeCategoryId,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (!categories.length) {
    return (
      <div className="px-4 py-6 text-center text-[12px] font-medium text-slate-400 bg-white/70 backdrop-blur-md rounded-2xl startup-shadow">
        No categories found
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 backdrop-blur-3xl transition-all duration-700 startup-shadow rounded-2xl">
      <div
        className="
          flex gap-2
          overflow-x-auto
          px-3 py-3
          scrollbar-hide
          touch-pan-x
          items-center
          scroll-smooth
        "
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;

          return (
            <div key={cat.id} className="relative flex-shrink-0 group">
              {/* ================= CATEGORY TILE ================= */}
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                className={clsx(
                  "relative flex flex-col items-center gap-1.5 p-2 rounded-2xl outline-none transition-all duration-300",
                  "min-w-[68px] max-w-[100px]",
                  isActive
                    ? "bg-[#F35C2B] text-white startup-shadow scale-[1.02] z-10"
                    : "hover:bg-black/[0.03] active:scale-95",
                )}
              >
                {/* ICON */}
                <div
                  className={clsx(
                    "w-10 h-10 rounded-[14px] flex items-center justify-center text-lg transition-all duration-500",
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-100/50 group-hover:bg-white",
                  )}
                >
                  <span className="transition-transform duration-500 group-hover:scale-110">
                    {cat.icon || "🍽️"}
                  </span>
                </div>

                {/* LABEL */}
                <span
                  className={clsx(
                    "w-full px-1 truncate text-center text-[8.5px] font-[900] uppercase tracking-[0.08em] leading-tight transition-all duration-300",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-black",
                  )}
                >
                  {cat.name}
                </span>

                {/* ACTIVE INDICATOR */}
                <div
                  className={clsx(
                    "absolute -bottom-0.5 h-[2px] rounded-full bg-[#F35C2B] transition-all duration-700",
                    isActive ? "w-4 opacity-100" : "w-0 opacity-0",
                  )}
                />
              </button>

              {/* ================= COMPACT ACTIONS (VISIBLE ON MOBILE) ================= */}
              {(onEdit || onDelete) && (
                <div
                  className="
                    absolute -top-1 -right-1
                    flex gap-1
                    /* Desktop: Hide and show on hover */
                    lg:opacity-0 lg:group-hover:opacity-100 lg:scale-50 lg:group-hover:scale-100
                    /* Mobile: Always visible but subtle */
                    opacity-100 scale-100
                    transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    z-20
                  "
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(cat);
                      }}
                      className="h-6 w-6 rounded-full bg-white/95 shadow-lg border border-black/[0.05] flex items-center justify-center text-slate-400 active:text-emerald-500 active:bg-emerald-50 transition-all active:scale-75"
                    >
                      <Pencil size={10} strokeWidth={3} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(cat.id);
                      }}
                      className="h-6 w-6 rounded-full bg-white/95 shadow-lg border border-black/[0.05] flex items-center justify-center text-slate-400 active:text-red-500 active:bg-red-50 transition-all active:scale-75"
                    >
                      <Trash2 size={10} strokeWidth={3} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
