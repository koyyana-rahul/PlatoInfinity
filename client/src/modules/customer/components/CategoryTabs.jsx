import { motion } from "framer-motion";
import clsx from "clsx";

const CategoryTabs = ({ categories, activeCategoryId, onSelect }) => {
  return (
    <div className="relative">
      <div className="flex space-x-2 md:space-x-4 p-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={clsx(
              "relative px-4 py-2 text-sm md:text-base font-bold whitespace-nowrap rounded-full transition-colors duration-200 focus:outline-none tap-scaling",
              {
                "text-white": activeCategoryId === cat.id,
                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface":
                  activeCategoryId !== cat.id,
              }
            )}
          >
            {activeCategoryId === cat.id && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute inset-0 bg-saffron rounded-full z-0"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
