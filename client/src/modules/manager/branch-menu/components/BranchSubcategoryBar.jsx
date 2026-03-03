export default function BranchSubcategoryBar({
  subcategories = [],
  activeSubcategoryId,
  onSelect,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
            activeSubcategoryId === null
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          All
        </button>

        {subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
              activeSubcategoryId === sub.id
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>
    </div>
  );
}
