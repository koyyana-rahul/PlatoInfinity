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
      <div className="py-10 text-center bg-white border-b border-gray-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          No categories found
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-[73px] sm:top-[81px] z-20 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto px-4 py-3 scrollbar-hide"
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;

            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-full border text-sm whitespace-nowrap transition-all",
                  isActive
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
                )}
              >
                <span className="text-base leading-none">
                  {cat.icon || "🍽️"}
                </span>
                <span className="font-semibold">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
