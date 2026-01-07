import { Pencil } from "lucide-react";

export default function BranchCategoryBar({
  categories = [],
  activeCategoryId,
  onSelect,
}) {
  if (!categories.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No categories imported yet
      </div>
    );
  }

  return (
    <div className="sticky top-[60px] z-30 bg-white border-b">
      <div className="flex gap-6 overflow-x-auto px-4 py-4 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                flex flex-col items-center gap-2 flex-shrink-0
                transition
                ${isActive ? "scale-110" : "opacity-70 hover:opacity-100"}
              `}
            >
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  ${
                    isActive
                      ? "bg-yellow-400 ring-4 ring-yellow-100"
                      : "bg-gray-100"
                  }
                `}
              >
                🍽️
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
