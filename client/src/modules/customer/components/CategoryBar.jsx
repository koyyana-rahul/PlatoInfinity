export default function CategoryBar({ categories, activeId, onSelect }) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-3.5 px-4 py-3 min-w-max">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap tracking-tight transition-all duration-200 active:scale-95 ${
              activeId === c.id
                ? "bg-[#F35C2B] text-white startup-shadow"
                : "bg-white text-slate-700 startup-shadow"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}