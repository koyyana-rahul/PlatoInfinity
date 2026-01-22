// src/modules/customer/components/SubcategoryFilter.jsx
export default function SubcategoryFilter({
  subcategories = [],
  activeId,
  onSelect,
}) {
  if (!subcategories.length) return null;

  return (
    <div
      className="
        relative
        px-4
        -mx-4
        overflow-x-auto
        no-scrollbar
        snap-x snap-mandatory
      "
    >
      <div className="flex gap-2 py-2 min-w-max">
        {/* ALL */}
        <FilterPill
          label="All"
          active={activeId === null}
          onClick={() => onSelect(null)}
        />

        {/* SUBCATEGORIES */}
        {subcategories.map((s) => (
          <FilterPill
            key={s.id}
            label={s.name}
            active={activeId === s.id}
            onClick={() => onSelect(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================
   SMALL PILL COMPONENT
============================ */

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        snap-start
        px-4 py-2
        rounded-full
        text-sm font-semibold
        whitespace-nowrap
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-black/20
        ${
          active
            ? "bg-black text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }
      `}
    >
      {label}
    </button>
  );
}
