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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="h-4 w-40 bg-gray-200 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center gap-3">
        {/* LOGO */}
        {brand.logoUrl ? (
          <div className="h-10 w-10 rounded-full ring-1 ring-gray-200 overflow-hidden">
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-extrabold text-sm">
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* BRAND NAME */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm sm:text-base font-extrabold truncate">
            {brand.name}
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 font-semibold truncate">
            Freshly served, fast & hot
          </span>
        </div>

        {/* ORDERS BUTTON */}
        <div className="ml-auto">
          {hasOrders && !isOrdersPage && (
            <button
              onClick={() => navigate(ordersBasePath)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow hover:bg-emerald-700 active:scale-95 transition"
            >
              <ClipboardList size={14} />
              Orders
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
