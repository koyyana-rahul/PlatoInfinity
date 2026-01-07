export default function BranchSubcategoryBar({
  subcategories = [],
  activeSubcategoryId,
  onSelect,
}) {
  return (
    <div className="bg-white border rounded-2xl px-3 py-3 shadow-sm">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
            activeSubcategoryId === null
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          All
        </button>

        {subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
              activeSubcategoryId === sub.id
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>
    </div>
  );
}
