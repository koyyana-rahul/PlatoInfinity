export default function CategoryBar({ categories, activeId, onSelect }) {
  return (
    <div className="sticky top-14 z-30 bg-white border-b">
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeId === c.id
                ? "bg-emerald-600 text-white"
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