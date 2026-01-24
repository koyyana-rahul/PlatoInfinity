/**
 * ResponsiveGrid.jsx
 * Responsive grid component for products, cards, and lists
 * Auto-adjusts columns based on screen size
 */

import clsx from "clsx";

export default function ResponsiveGrid({
  children,
  className = "",
  cols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  gap = "gap-3 sm:gap-4 md:gap-5 lg:gap-6",
}) {
  return <div className={clsx("grid", cols, gap, className)}>{children}</div>;
}
