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
      <header className="sticky top-0 z-40 rounded-3xl bg-white/95 ring-1 ring-black/5 shadow-[0_16px_40px_-28px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="h-16 sm:h-[70px] w-full px-3 sm:px-4 md:px-6 lg:px-8 flex items-center gap-2 sm:gap-3 animate-pulse">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 sm:w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 sm:w-28 bg-gray-100 rounded" />
          </div>
          <div className="h-9 w-20 bg-gray-200 rounded-xl" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 rounded-3xl bg-white/95 ring-1 ring-black/5 shadow-[0_16px_40px_-28px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: LOGO & BRAND */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {brand.logoUrl ? (
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm flex-shrink-0">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-full object-contain p-0.5"
              />
            </div>
          ) : (
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-[#FC8019] to-[#FF6B35] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md flex-shrink-0">
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-[15px] font-extrabold text-gray-900 truncate leading-tight tracking-tight">
              {brand.name}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 truncate font-semibold leading-tight capitalize">
              {restaurantSlug?.replace(/-/g, " ")}
            </span>
          </div>
        </div>

        {/* RIGHT: ORDERS BUTTON */}
        {hasOrders && !isOrdersPage && (
          <button
            onClick={() => navigate(ordersBasePath)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] text-white text-[11px] sm:text-xs font-black hover:brightness-105 active:scale-[0.97] transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 uppercase tracking-wider"
          >
            <ClipboardList
              size={16}
              className="sm:w-[18px] sm:h-[18px]"
              strokeWidth={2.5}
            />
            <span className="hidden xs:inline">Orders</span>
            <span className="xs:hidden">View</span>
          </button>
        )}
      </div>
    </header>
  );
}
