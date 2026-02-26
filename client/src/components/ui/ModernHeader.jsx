import clsx from "clsx";
import { Menu, X, ShoppingCart, Home, LogOut } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

/**
 * ModernHeader Component
 * 2026 Professional Design - Swiggy/Zomato Style
 * Fully responsive header with mobile-first navigation
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

  const bgClass = variant === "dark" ? "bg-gray-900 text-white" : "bg-white";
  const shadowClass = "shadow-[0_2px_8px_rgba(0,0,0,0.08)]";

  return (
    <>
      {/* Header */}
      <header
        className={clsx(
          "h-14 sm:h-16 transition-all duration-200",
          bgClass,
          shadowClass,
          "backdrop-blur-md",
          sticky && "sticky top-0",
          "z-40",
        )}
      >
        <div className="h-full w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="h-full flex items-center justify-between gap-3 sm:gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {logo ? (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm flex-shrink-0">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain p-0.5"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#FC8019] to-[#FF6B35] text-white flex items-center justify-center font-semibold text-xs sm:text-sm shadow-md flex-shrink-0">
                  {title.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate leading-tight">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Search Bar (Desktop Only) */}
            {showSearch && (
              <div className="hidden lg:flex flex-1 max-w-md">
                <input
                  type="search"
                  placeholder="Search dishes..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FC8019] focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Desktop Actions & Navigation */}
            <div className="hidden md:flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#FC8019] hover:bg-orange-50 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}

              {/* Cart Button */}
              {onCartClick && (
                <div className="relative">
                  <button
                    onClick={onCartClick}
                    className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Custom Actions */}
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "secondary"}
                  size="sm"
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
                  <button
                    onClick={onCartClick}
                    className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors relative flex-shrink-0"
                  >
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X size={20} strokeWidth={2.5} />
                ) : (
                  <Menu size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="lg:hidden pb-3">
              <input
                type="search"
                placeholder="Search dishes..."
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#FC8019] focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav
          className={clsx(
            "fixed top-14 sm:top-16 left-0 right-0 z-40 max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto",
            bgClass,
            "shadow-lg",
            "md:hidden",
          )}
        >
          <div className="px-3 sm:px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
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
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700 flex items-center gap-3"
              >
                {action.icon && (
                  <action.icon className="w-5 h-5 text-[#FC8019]" />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
