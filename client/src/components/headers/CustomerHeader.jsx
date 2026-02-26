// src/components/headers/CustomerHeader.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ClipboardList } from "lucide-react";

import { selectHasOrders } from "../../store/customer/orderSelectors";

export default function CustomerHeader() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const brand = useSelector((s) => s.brand);
  const hasOrders = useSelector(selectHasOrders);

  const ordersBasePath = `/${brandSlug}/${restaurantSlug}/table/${tableId}/orders`;
  const isOrdersPage = location.pathname.startsWith(ordersBasePath);

  if (!brand?._id) {
    return (
      <header className="sticky top-0 z-40 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="h-14 sm:h-16 w-full px-3 sm:px-4 md:px-6 lg:px-8 flex items-center gap-2 sm:gap-3 animate-pulse">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="h-4 w-28 sm:w-32 bg-gray-200 rounded flex-shrink-0" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="h-14 sm:h-16 w-full px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: LOGO & BRAND */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {brand.logoUrl ? (
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm flex-shrink-0">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-full object-contain p-0.5"
              />
            </div>
          ) : (
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#FC8019] to-[#FF6B35] text-white flex items-center justify-center font-semibold text-xs sm:text-sm shadow-md flex-shrink-0">
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-semibold text-gray-900 truncate leading-tight">
              {brand.name}
            </span>
            <span className="hidden sm:inline text-[10px] sm:text-xs text-gray-500 truncate">
              Fresh food delivered fast
            </span>
          </div>
        </div>

        {/* RIGHT: ORDERS BUTTON */}
        {hasOrders && !isOrdersPage && (
          <button
            onClick={() => navigate(ordersBasePath)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white text-xs sm:text-sm font-semibold hover:from-green-700 hover:to-green-600 active:scale-[0.97] transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
          >
            <ClipboardList
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
              strokeWidth={2.5}
            />
            <span className="hidden xs:inline">My Orders</span>
            <span className="xs:hidden">Orders</span>
          </button>
        )}
      </div>
    </header>
  );
}
