import { useRef } from "react";
import clsx from "clsx";

export default function BranchCategoryBar({
  categories = [],
  activeCategoryId,
  onSelect,
}) {
  const scrollRef = useRef(null);

  if (!categories.length) {
    return (
      <div className="py-12 text-center bg-white border-b border-slate-100">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
          No categories found
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
      <div className="max-w-[1400px] mx-auto relative">
        {/* SCROLLABLE CONTAINER */}
        <div
          ref={scrollRef}
          className="flex items-center gap-8 overflow-x-auto px-6 py-5 scrollbar-hide snap-x scroll-smooth"
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;

            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={clsx(
                  "flex flex-col items-center gap-3 flex-shrink-0 transition-all duration-300 snap-center outline-none active:scale-90 group",
                  isActive ? "scale-105" : "hover:translate-y-[-2px]",
                )}
              >
                {/* THE EXACT CIRCLE */}
                <div
                  className={clsx(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative",
                    "shadow-[0_8px_30px_rgb(0,0,0,0.04)]", // Soft base shadow
                    isActive
                      ? "bg-emerald-500 text-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] ring-4 ring-emerald-50"
                      : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] group-hover:text-emerald-500",
                  )}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {cat.icon || "🍽️"}
                  </span>

                  {/* BOTTOM ACTIVE DOT */}
                  {isActive && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </div>

                {/* LABEL */}
                <span
                  className={clsx(
                    "text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300",
                    isActive
                      ? "text-slate-900"
                      : "text-slate-400 group-hover:text-slate-600",
                  )}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* FADE GRADIENTS FOR SLEEK SCROLLING */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none hidden md:block" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Smooth elastic scaling for circles */
        button div {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `,
        }}
      />
    </div>
  );
}
