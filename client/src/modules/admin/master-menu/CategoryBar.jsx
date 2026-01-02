import { Pencil, Trash2 } from "lucide-react";

export default function CategoryBar({
  categories = [],
  activeCategoryId,
  onSelect, // parent MUST reset subcategory to null (ALL)
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
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div
        className="
          flex gap-5 overflow-x-auto px-4 py-4
          scrollbar-hide
          touch-pan-x
        "
        role="tablist"
        aria-label="Menu Categories"
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;

          return (
            <div key={cat.id} className="relative flex-shrink-0 group">
              {/* CATEGORY BUTTON */}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(cat.id)} // 🔥 parent resets subcategory
                className={`
                  flex flex-col items-center gap-2
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-black
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
                    text-xl shadow-sm transition-all
                    ${
                      isActive
                        ? "bg-yellow-400 text-black ring-4 ring-yellow-100"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  {cat.icon || "🍽️"}
                </div>

                {/* LABEL */}
                <span
                  title={cat.name}
                  className={`
                    max-w-[64px] truncate
                    text-[10px] font-black uppercase tracking-widest
                    ${isActive ? "text-yellow-600" : "text-gray-400"}
                  `}
                >
                  {cat.name}
                </span>
              </button>

              {/* ADMIN ACTIONS */}
              {(onEdit || onDelete) && (
                <div
                  className="
                    absolute -top-1 -right-1
                    hidden group-hover:flex
                    md:flex md:opacity-0 md:group-hover:opacity-100
                    transition
                  "
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(cat);
                      }}
                      className="
                        p-1 bg-white rounded-full shadow border
                        text-gray-400 hover:text-blue-600
                      "
                      aria-label="Edit category"
                    >
                      <Pencil size={12} />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(cat.id);
                      }}
                      className="
                        p-1 bg-white rounded-full shadow border
                        text-gray-400 hover:text-red-600
                      "
                      aria-label="Delete category"
                    >
                      <Trash2 size={12} />
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
