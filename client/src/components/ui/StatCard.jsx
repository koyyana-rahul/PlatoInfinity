/**
 * StatCard.jsx
 * Responsive stat card for displaying KPIs
 * Shows metric with value, trend, and icon
 */

import clsx from "clsx";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend = null,
  trendLabel = "",
  bgColor = "bg-blue-50",
  borderColor = "border-blue-200",
  iconColor = "text-blue-600",
  onClick = null,
}) {
  const isPositive = trend > 0;

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-lg border p-4 sm:p-5 md:p-6",
        borderColor,
        bgColor,
        "transition-all duration-200",
        {
          "hover:shadow-lg cursor-pointer": onClick,
        },
      )}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
            {label}
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        {Icon && <Icon className={clsx("w-6 h-6 sm:w-8 sm:h-8", iconColor)} />}
      </div>

      {trend !== null && (
        <div className="flex items-center gap-1 text-xs sm:text-sm">
          {isPositive ? (
            <>
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">{trend}%</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-medium">
                {Math.abs(trend)}%
              </span>
            </>
          )}
          <span className="text-gray-500">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
