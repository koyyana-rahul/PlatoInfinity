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
      <div className="flex gap-3 py-2.5 min-w-max">
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
        px-6 py-3
        rounded-full
        text-sm font-semibold tracking-tight
        whitespace-nowrap
        transition-all duration-200
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-orange-200
        ${
          active
            ? "bg-[#F35C2B] text-white startup-shadow"
            : "bg-white text-slate-600 startup-shadow"
        }
      `}
    >
      {label}
    </button>
  );
}
