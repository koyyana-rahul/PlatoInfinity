import clsx from "clsx";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

const filters = [
  { id: "all", label: "All" },
  { id: "veg", label: "Veg", isVeg: true },
  { id: "nonveg", label: "Non-Veg", isVeg: false },
];

const MenuHeader = ({ vegFilter, onVegFilterChange }) => {
  return (
    <div className="bg-cream dark:bg-dark-bg/80 backdrop-blur-lg w-full px-4 pt-4 pb-2">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-green dark:text-cream tracking-tight">
            Our Menu
          </h1>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-saffron-light/30 rounded-full">
            <div className="h-2 w-2 rounded-full bg-saffron animate-pulse" />
            <p className="text-[9px] font-bold text-saffron uppercase tracking-widest">
              Live
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center bg-gray-100 dark:bg-dark-surface rounded-full p-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onVegFilterChange(filter.id)}
            className={clsx(
              "w-full px-3 py-2 text-sm font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 tap-scaling",
              {
                "bg-white dark:bg-black/20 text-deep-green dark:text-white shadow-sm":
                  vegFilter === filter.id,
                "text-gray-500 hover:text-deep-green": vegFilter !== filter.id,
              }
            )}
          >
            {filter.isVeg !== undefined && <VegNonVegIcon isVeg={filter.isVeg} />}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuHeader;
