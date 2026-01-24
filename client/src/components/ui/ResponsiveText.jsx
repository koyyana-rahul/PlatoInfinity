/**
 * ResponsiveText.jsx
 * Responsive typography component with consistent sizing
 */

import clsx from "clsx";

export default function ResponsiveText({
  children,
  variant = "body", // heading1, heading2, heading3, body, small, tiny
  className = "",
}) {
  const variants = {
    heading1:
      "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
    heading2:
      "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-snug",
    heading3: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold",
    body: "text-sm sm:text-base md:text-base lg:text-lg leading-relaxed",
    small: "text-xs sm:text-sm md:text-sm lg:text-base",
    tiny: "text-xs leading-snug",
  };

  return <p className={clsx(variants[variant], className)}>{children}</p>;
}
