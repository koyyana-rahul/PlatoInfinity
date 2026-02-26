import { useEffect, useRef } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import clsx from "clsx";

export default function SubcategoryBar({
  subcategories = [],
  activeSubcategoryId = null,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  disableExpand = false,
}) {
  const trackRef = useRef(null);
  const itemRefs = useRef(new Map());

  const scrollItemIntoView = (id) => {
    const el = itemRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  useEffect(() => {
    if (activeSubcategoryId === null) {
      scrollItemIntoView("__all__");
      return;
    }
    scrollItemIntoView(activeSubcategoryId);
  }, [activeSubcategoryId]);

  return (
    /* OUTER TRACK */
    <div className="relative bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
      <div
        ref={trackRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide items-center touch-pan-x scroll-smooth px-1 py-1 snap-x snap-mandatory"
        role="tablist"
        style={{ WebkitOverflowScrolling: "touch" }}
        onWheel={(e) => {
          if (!trackRef.current) return;
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.currentTarget.scrollBy({ left: e.deltaY, behavior: "auto" });
          }
        }}
      >
        {/* ================= ALL SECTION ================= */}
        <button
          type="button"
          role="tab"
          aria-selected={activeSubcategoryId === null}
          ref={(el) => {
            if (el) itemRefs.current.set("__all__", el);
          }}
          onClick={() => {
            onSelect(null);
            scrollItemIntoView("__all__");
          }}
          className={clsx(
            "flex-shrink-0 h-10 rounded-lg text-xs font-semibold transition-all snap-start",
            activeSubcategoryId === null
              ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white shadow-md px-5 min-w-fit"
              : "text-gray-600 hover:text-gray-900 active:scale-[0.98] px-4 min-w-[50px]",
          )}
        >
          All
        </button>

        {/* ================= SUBCATEGORIES ================= */}
        {subcategories.map((sub) => {
          const isActive = sub.id === activeSubcategoryId;

          return (
            <div key={sub.id} className="relative flex-shrink-0 snap-start">
              {/* THE PILL BUTTON */}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                ref={(el) => {
                  if (el) itemRefs.current.set(sub.id, el);
                }}
                onClick={() => {
                  onSelect(sub.id);
                  scrollItemIntoView(sub.id);
                }}
                className={clsx(
                  "relative flex items-center justify-center rounded-lg text-xs font-semibold transition-all h-10 snap-start",
                  isActive
                    ? disableExpand
                      ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white shadow-md px-4 min-w-fit z-10"
                      : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white shadow-md px-5 min-w-fit z-10"
                    : "bg-transparent text-gray-600 hover:text-gray-900 active:scale-[0.98] px-4 min-w-[70px] max-w-[130px]",
                )}
                title={sub.name}
              >
                <span
                  className={clsx(
                    "w-full text-center",
                    isActive ? "whitespace-nowrap" : "truncate",
                  )}
                >
                  {sub.name}
                </span>
              </button>

              {/* ================= ADMIN CONTROLS ================= */}
              {(onEdit || onDelete) && (
                <div
                  className={clsx(
                    "absolute inset-0 flex items-center justify-between px-1.5 transition-all pointer-events-none z-20",
                    isActive
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-75",
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
                      className="w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 active:scale-110 transition-all border border-gray-200"
                    >
                      <Pencil size={11} strokeWidth={2.5} />
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
                      className="w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-110 transition-all border border-gray-200"
                    >
                      <Trash2 size={11} strokeWidth={2.5} />
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
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 ml-1 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] rounded-lg text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
