/**
 * EmptyState.jsx
 * Responsive empty state component for when no data is available
 */

import clsx from "clsx";

export default function EmptyState({
  icon: Icon,
  title = "No Data",
  message = "There's nothing to show here.",
  action = null,
  image = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
      {image && (
        <img
          src={image}
          alt="empty"
          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain mb-4 sm:mb-6"
        />
      )}
      {Icon && (
        <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" />
      )}
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-500 text-center max-w-md mb-6">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
