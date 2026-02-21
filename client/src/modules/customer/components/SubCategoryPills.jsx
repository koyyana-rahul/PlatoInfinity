import clsx from "clsx";

const SubCategoryPills = ({
  subcategories,
  activeSubcategoryId,
  onSelect,
}) => {
  if (!subcategories || subcategories.length <= 1) {
    return null;
  }

  const handleSelect = (id) => {
    // If the active pill is clicked again, deselect it to show all items
    onSelect(activeSubcategoryId === id ? null : id);
  };

  return (
    <div className="flex space-x-2 pb-2 px-4 overflow-x-auto no-scrollbar">
      {subcategories.map((sub) => (
        <button
          key={sub.id}
          onClick={() => handleSelect(sub.id)}
          className={clsx(
            "px-4 py-2 text-xs md:text-sm font-semibold whitespace-nowrap rounded-full transition-all duration-200 tap-scaling",
            {
              "bg-deep-green text-white shadow-md":
                activeSubcategoryId === sub.id,
              "bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700":
                activeSubcategoryId !== sub.id,
            }
          )}
        >
          {sub.name}
        </button>
      ))}
    </div>
  );
};

export default SubCategoryPills;
