import clsx from "clsx";
import Button from "./Button";

/**
 * FoodCard Component
 * 2026 "Savory Modern" Design System
 * Specialized card for displaying food items with image, title, price, and actions
 * Features: Lazy loading, micro-interactions, responsive design
 */
export default function FoodCard({
  image = "",
  title = "Dish Name",
  description = "",
  price = "0",
  originalPrice = null,
  badge = null,
  badgeVariant = "hot",
  onAddClick = () => {},
  onCardClick = () => {},
  isVeg = null,
  rating = null,
  reviewCount = 0,
  loading = false,
  disabled = false,
  className = "",
  variant = "default",
}) {
  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  const vegNonVegClass =
    isVeg === true ? "bg-green-100" : isVeg === false ? "bg-red-100" : "";
  const vegNonVegText =
    isVeg === true ? "Veg" : isVeg === false ? "Non-Veg" : "";

  return (
    <div
      onClick={onCardClick}
      className={clsx(
        "food-card group cursor-pointer",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {/* Image Container with Badge */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="food-card-image object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount/Badge Overlay */}
        {discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discount}%
          </div>
        )}

        {/* Custom Badge */}
        {badge && (
          <div
            className={clsx(
              "absolute top-3 left-3 badge",
              `badge-${badgeVariant}`,
            )}
          >
            {badge}
          </div>
        )}

        {/* Veg/Non-Veg Indicator */}
        {vegNonVegText && (
          <div
            className={clsx(
              "absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-bold text-white",
              vegNonVegClass,
              isVeg
                ? "bg-green-600"
                : isVeg === false
                  ? "bg-red-600"
                  : "bg-gray-600",
            )}
          >
            {vegNonVegText}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="food-card-content">
        {/* Title */}
        <h3 className="food-card-title line-clamp-2 group-hover:text-brand-cta transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="food-card-description line-clamp-2">{description}</p>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={clsx(
                    "text-xs",
                    i < Math.floor(rating)
                      ? "text-yellow-400"
                      : "text-gray-300",
                  )}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">{rating.toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Footer: Price + Button */}
        <div className="food-card-footer">
          <div className="flex flex-col gap-0.5">
            <div className=" 2xl:text-lg font-bold text-brand-cta">
              ₹{parseFloat(price).toFixed(2)}
            </div>
            {originalPrice && originalPrice > price && (
              <div className="text-xs text-gray-400 line-through">
                ₹{parseFloat(originalPrice).toFixed(2)}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            disabled={disabled}
            loading={loading}
            className="whitespace-nowrap"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
