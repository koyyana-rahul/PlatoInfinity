export default function CustomerSubcategoryBar({
  subcategories,
  activeSubcategoryId,
  onSelect,
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-xs ${
          activeSubcategoryId === null ? "bg-black text-white" : "bg-gray-100"
        }`}
      >
        All
      </button>

      {subcategories.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
            activeSubcategoryId === s.id ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
