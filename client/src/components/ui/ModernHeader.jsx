import clsx from "clsx";
import { Menu, X, ShoppingCart, Home, LogOut } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

/**
 * ModernHeader Component
 * 2026 "Savory Modern" Design System
 * Responsive header with mobile-first navigation
 */
export default function ModernHeader({
  logo = null,
  title = "Plato",
  subtitle = null,
  actions = [],
  navItems = [],
  onMenuClick = null,
  showSearch = false,
  onSearch = null,
  cartCount = 0,
  onCartClick = null,
  variant = "light", // light, dark
  sticky = true,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bgClass =
    variant === "dark" ? "bg-text-primary text-white" : "bg-bg-secondary";
  const borderClass =
    variant === "dark" ? "border-gray-700" : "border-gray-100";
  const logoCircleClass =
    variant === "dark"
      ? "bg-brand-cta text-white ring-gray-700"
      : "bg-brand-cta text-white ring-gray-200";

  return (
    <>
      {/* Desktop Header */}
      <header
        className={clsx(
          "header transition-all duration-300",
          bgClass,
          "border-b",
          borderClass,
          sticky && "sticky top-0",
          "z-40",
        )}
      >
        <div className="container-safe">
          <div className="flex items-center justify-between gap-4 py-4 sm:py-3 md:py-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {logo ? (
                <div
                  className={clsx(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-offset-2 overflow-hidden flex-shrink-0",
                    logoCircleClass,
                  )}
                >
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className={clsx(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-offset-2 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0",
                    logoCircleClass,
                  )}
                >
                  {title.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-shrink-0 min-w-0">
                <p className="text-sm sm:text-base font-bold truncate">
                  {title}
                </p>
                {subtitle && (
                  <p
                    className={clsx(
                      "text-xs hidden sm:block truncate",
                      variant === "dark" ? "text-gray-300" : "text-gray-500",
                    )}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Search Bar (Desktop Only) */}
            {showSearch && (
              <div className="hidden md:flex flex-1 max-w-sm mx-4">
                <input
                  type="search"
                  placeholder="Search dishes..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm focus:ring-2 focus:ring-brand-cta focus:border-transparent"
                />
              </div>
            )}

            {/* Desktop Actions & Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="px-4 py-2 text-sm font-medium transition-colors hover:text-brand-cta"
                >
                  {item.label}
                </button>
              ))}

              {/* Cart Button */}
              {onCartClick && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={onCartClick}
                    Icon={ShoppingCart}
                  >
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-cta text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* Custom Actions */}
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "secondary"}
                  size="md"
                  onClick={action.onClick}
                  Icon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Mobile: Cart + Menu Toggle */}
            <div className="flex md:hidden items-center gap-2 flex-shrink-0">
              {onCartClick && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCartClick}
                    Icon={ShoppingCart}
                    className="p-2"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-cta text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="btn-icon p-2 active:scale-95 transition"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="md:hidden pb-3">
              <input
                type="search"
                placeholder="Search dishes..."
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm focus:ring-2 focus:ring-brand-cta focus:border-transparent"
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className={clsx(
            "fixed inset-0 z-30 mt-0",
            variant === "dark" ? "bg-black/50" : "bg-black/30",
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav
          className={clsx(
            "fixed top-16 left-0 right-0 z-30 max-h-[calc(100vh-64px)] overflow-y-auto",
            bgClass,
            "border-b",
            borderClass,
            "md:hidden",
          )}
        >
          <div className="container-safe py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                {item.label}
              </button>
            ))}

            {/* Mobile Custom Actions */}
            {actions.length > 0 && (
              <div className="border-t border-gray-200 my-2 pt-2" />
            )}
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  action.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
