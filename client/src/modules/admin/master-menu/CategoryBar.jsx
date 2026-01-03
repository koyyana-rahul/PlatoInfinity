import { Pencil, Trash2 } from "lucide-react";

export default function CategoryBar({
  categories = [],
  activeCategoryId,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (!categories.length) {
    return (
      <div className="px-4 py-6 text-center text-sm text-gray-400 border-b">
        No categories created yet
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b">
      <div
        className="
          flex gap-6
          overflow-x-auto
          px-4 py-4
          scrollbar-hide
          touch-pan-x
        "
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;

          return (
            <div
              key={cat.id}
              className="
                relative
                flex-shrink-0
                group
              "
            >
              {/* ================= CATEGORY ================= */}
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                className={`
                  flex flex-col items-center gap-2
                  transition-all duration-200
                  focus:outline-none
                  ${
                    isActive
                      ? "scale-110"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  }
                `}
              >
                {/* ICON */}
                <div
                  className={`
                    w-14 h-14 rounded-full
                    flex items-center justify-center
                    shadow-sm
                    transition-all
                    ${
                      isActive
                        ? "bg-yellow-400 ring-4 ring-yellow-100"
                        : "bg-gray-100"
                    }
                  `}
                >
                  {cat.icon || "🍽️"}
                </div>

                {/* NAME */}
                <span
                  className={`
                    max-w-[64px] truncate
                    text-[10px] font-black uppercase tracking-widest
                    ${isActive ? "text-yellow-600" : "text-gray-400"}
                  `}
                >
                  {cat.name}
                </span>
              </button>

              {/* ================= ACTIONS ================= */}
              {(onEdit || onDelete) && (
                <div
                  className="
                    absolute -top-2 -right-2
                    flex gap-1
                    opacity-100 sm:opacity-0
                    group-hover:opacity-100
                    transition-opacity
                  "
                >
                  {/* EDIT */}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(cat);
                      }}
                      className="
                        h-8 w-8
                        rounded-full
                        bg-white border
                        shadow-sm
                        flex items-center justify-center
                        text-gray-500
                        hover:text-blue-600
                        hover:bg-blue-50
                        active:scale-95
                        transition
                      "
                      aria-label="Edit category"
                    >
                      <Pencil size={14} />
                    </button>
                  )}

                  {/* DELETE */}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(cat.id);
                      }}
                      className="
                        h-8 w-8
                        rounded-full
                        bg-white border
                        shadow-sm
                        flex items-center justify-center
                        text-gray-500
                        hover:text-red-600
                        hover:bg-red-50
                        active:scale-95
                        transition
                      "
                      aria-label="Delete category"
                    >
                      <Trash2 size={14} />
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
