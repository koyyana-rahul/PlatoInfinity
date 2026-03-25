import { House, Search, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTotalQty } from "../../../store/customer/cartSelectors";

export default function MobileBottomNav() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const qty = useSelector(selectTotalQty);

  if (!brandSlug || !restaurantSlug || !tableId) return null;

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;
  const path = location.pathname;

  const tabs = [
    {
      key: "home",
      label: "Home",
      icon: House,
      to: `${base}/menu`,
      active: path.includes("/menu"),
    },
    {
      key: "search",
      label: "Search",
      icon: Search,
      to: `${base}/menu#browse`,
      active: path.includes("/menu") && location.hash === "#browse",
    },
    {
      key: "cart",
      label: "Cart",
      icon: ShoppingCart,
      to: `${base}/cart`,
      active: path.includes("/cart"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-1.25rem)] max-w-md rounded-[28px] bg-white/90 backdrop-blur-xl shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.to)}
              className={`relative h-14 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-tight transition-all active:scale-95 ${
                tab.active
                  ? "bg-[#F35C2B] text-white shadow-[0_10px_25px_-15px_rgba(243,92,43,0.6)]"
                  : "text-slate-500 bg-transparent"
              }`}
            >
              <div className="relative">
                <Icon size={18} />
                {tab.key === "cart" && qty > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#F35C2B] text-[10px] font-black flex items-center justify-center shadow">
                    {qty}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
