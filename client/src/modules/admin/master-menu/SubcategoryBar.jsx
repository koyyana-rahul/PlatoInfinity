import { Pencil, Trash2, Plus } from "lucide-react";

/**
 * SubcategoryBar
 * --------------------------------------------------
 * Rules:
 * • activeSubcategoryId === null → ALL section
 * • Parent MUST set activeSubcategoryId = null on category change
 * • ALL shows all category items
 * • Add Item handled by ItemGrid (not here)
 */
export default function SubcategoryBar({
  subcategories = [],
  activeSubcategoryId = null,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-3 sm:px-4 py-3 shadow-sm">
      <div
        className="
          flex gap-2 sm:gap-3
          overflow-x-auto scrollbar-hide
          items-center
          touch-pan-x
        "
        role="tablist"
        aria-label="Menu sections"
      >
        {/* ================= ALL ================= */}
        <button
          type="button"
          role="tab"
          aria-selected={activeSubcategoryId === null}
          onClick={() => onSelect(null)}
          className={`
            flex-shrink-0
            px-4 py-2
            rounded-full
            text-xs font-black uppercase tracking-widest
            transition
            ${
              activeSubcategoryId === null
                ? "bg-black text-white ring-2 ring-black"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }
          `}
        >
          All
        </button>

        {/* ================= SUBCATEGORIES ================= */}
        {subcategories.map((sub) => {
          const isActive = sub.id === activeSubcategoryId;

          return (
            <div key={sub.id} className="relative group flex-shrink-0">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(sub.id)}
                className={`
                  max-w-[160px] truncate
                  px-4 py-2
                  rounded-full
                  text-xs font-black uppercase tracking-widest
                  transition
                  ${
                    isActive
                      ? "bg-black text-white ring-2 ring-black"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }
                `}
              >
                {sub.name}
              </button>

              {/* ADMIN ACTIONS */}
              {(onEdit || onDelete) && (
                <div
                  className="
                    absolute -top-2 -right-2
                    hidden group-hover:flex
                    md:flex md:opacity-0 md:group-hover:opacity-100
                    gap-1 transition
                  "
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sub);
                      }}
                      className="
                        p-1 bg-white rounded-full shadow border
                        text-gray-400 hover:text-blue-600
                      "
                      aria-label="Edit section"
                    >
                      <Pencil size={10} />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sub.id);
                      }}
                      className="
                        p-1 bg-white rounded-full shadow border
                        text-gray-400 hover:text-red-600
                      "
                      aria-label="Delete section"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ================= ADD SECTION ================= */}
        {onAdd && (
          <button
            type="button" // 🔥 REQUIRED FIX
            onClick={onAdd}
            className="
              flex-shrink-0
              flex items-center gap-2
              px-4 py-2
              border-2 border-dashed border-gray-300
              rounded-full
              text-xs font-black text-gray-400
              hover:border-black hover:text-black
              transition
            "
          >
            <Plus size={14} />
            Section
          </button>
        )}
      </div>
    </div>
  );
}
