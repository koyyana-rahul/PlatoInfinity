/**
 * LoadingSpinner.jsx
 * Responsive loading spinner
 */

import clsx from "clsx";

export default function LoadingSpinner({
  size = "md",
  message = "Loading...",
}) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div
        className={clsx(
          sizes[size],
          "border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin",
        )}
      />
      {message && (
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
