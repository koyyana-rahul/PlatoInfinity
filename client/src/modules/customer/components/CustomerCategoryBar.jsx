export default function CustomerCategoryBar({
  categories,
  activeCategoryId,
  onSelect,
}) {
  return (
    <div className="sticky top-[112px] z-20 bg-white border-b">
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeCategoryId === c.id
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
