/**
 * ResponsiveContainer.jsx
 * Universal responsive container with consistent padding and max-width
 * Ensures consistent spacing across all screen sizes
 */

import clsx from "clsx";

export default function ResponsiveContainer({
  children,
  className = "",
  maxWidth = "max-w-7xl",
  padding = "px-4 sm:px-6 md:px-8 lg:px-10",
}) {
  return (
    <div className={clsx("mx-auto w-full", maxWidth, padding, className)}>
      {children}
    </div>
  );
}
