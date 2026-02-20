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
    /* OUTER TRACK - Apple Control Center Style */
    <div className="relative bg-white rounded-3xl p-1.5 startup-shadow">
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
            "flex-shrink-0 h-10 rounded-full text-[10px] font-[800] uppercase tracking-widest transition-all duration-300 snap-start",
            activeSubcategoryId === null
              ? "bg-[#F35C2B] text-white startup-shadow px-6 min-w-fit"
              : "text-slate-500 hover:text-black active:scale-95 px-4 min-w-[50px]",
          )}
        >
          All
        </button>

        {/* ================= SUBCATEGORIES ================= */}
        {subcategories.map((sub) => {
          const isActive = sub.id === activeSubcategoryId;

          return (
            <div key={sub.id} className="relative flex-shrink-0 snap-start">
              {/* THE PILL BUTTON 
                  We use PX-12 and MIN-W-140 only when active to reveal icons.
                  The transition-all duration-500 creates the 'slide out' expansion effect.
              */}
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
                  "relative flex items-center justify-center rounded-full text-[10px] font-[800] uppercase tracking-widest transition-all duration-300 h-10 snap-start",
                  isActive
                    ? disableExpand
                      ? "bg-[#F35C2B] text-white startup-shadow px-4 min-w-fit z-10"
                      : "bg-[#F35C2B] text-white startup-shadow px-6 min-w-fit z-10"
                    : "bg-transparent text-slate-500 hover:text-black active:scale-95 px-4 min-w-[70px] max-w-[130px]",
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
