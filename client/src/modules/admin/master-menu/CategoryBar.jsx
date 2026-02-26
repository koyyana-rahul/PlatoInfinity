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
      <div className="px-4 py-6 text-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
        No categories found
      </div>
    );
  }

  return (
    <div className="w-full bg-white transition-all">
      <div
        className="
          flex gap-2
          overflow-x-auto
          px-3 sm:px-4 py-3
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
                  "relative flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-xl outline-none transition-all",
                  "min-w-[68px] sm:min-w-[80px] max-w-[100px]",
                  isActive
                    ? "bg-gradient-to-br from-[#FC8019] to-[#FF6B35] text-white shadow-md scale-[1.02] z-10"
                    : "hover:bg-gray-50 active:scale-[0.98]",
                )}
              >
                {/* ICON */}
                <div
                  className={clsx(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg transition-all",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 group-hover:bg-gray-200",
                  )}
                >
                  <span className="transition-transform group-hover:scale-110">
                    {cat.icon || "🍽️"}
                  </span>
                </div>

                {/* LABEL */}
                <span
                  className={clsx(
                    "w-full px-1 truncate text-center text-xs font-semibold leading-tight transition-all",
                    isActive
                      ? "text-white"
                      : "text-gray-600 group-hover:text-gray-900",
                  )}
                >
                  {cat.name}
                </span>

                {/* ACTIVE INDICATOR */}
                <div
                  className={clsx(
                    "absolute -bottom-0.5 h-[2px] rounded-full bg-[#FC8019] transition-all",
                    isActive ? "w-4 opacity-100" : "w-0 opacity-0",
                  )}
                />
              </button>

              {/* ================= COMPACT ACTIONS ================= */}
              {(onEdit || onDelete) && (
                <div
                  className="
                    absolute -top-1 -right-1
                    flex gap-1
                    lg:opacity-0 lg:group-hover:opacity-100 lg:scale-75 lg:group-hover:scale-100
                    opacity-100 scale-100
                    transition-all
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
                      className="h-6 w-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all active:scale-75"
                    >
                      <Pencil size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(cat.id);
                      }}
                      className="h-6 w-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-75"
                    >
                      <Trash2 size={10} strokeWidth={2.5} />
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
