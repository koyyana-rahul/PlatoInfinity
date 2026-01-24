/**
 * ResponsiveCard.jsx
 * Responsive card component with consistent padding and borders
 * Works on all screen sizes
 */

import clsx from "clsx";

export default function ResponsiveCard({
  children,
  className = "",
  clickable = false,
  onClick = null,
  padding = "p-3 sm:p-4 md:p-5 lg:p-6",
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-lg border border-gray-200 bg-white",
        padding,
        "transition-all duration-200",
        {
          "hover:shadow-lg hover:border-gray-300 cursor-pointer": clickable,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
