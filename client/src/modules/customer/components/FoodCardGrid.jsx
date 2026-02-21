import FoodCard from "./FoodCard";
import { AnimatePresence, motion } from "framer-motion";

const FoodCardGrid = ({ items, quantities, onAdd, onMinus }) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
          No items to display
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Try selecting a different category or clearing the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      <AnimatePresence>
        {items.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            quantity={quantities[item.id] || 0}
            onAdd={onAdd}
            onMinus={onMinus}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FoodCardGrid;
