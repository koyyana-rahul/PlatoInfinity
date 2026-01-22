// src/modules/customer/components/StickyCartBar.jsx
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import {
  selectTotalQty,
  selectTotalAmount,
} from "../../../store/customer/cartSelectors";

export default function StickyCartBar() {
  const qty = useSelector(selectTotalQty);
  const total = useSelector(selectTotalAmount);

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= GUARDS ================= */

  // No cart → hide
  if (!qty || qty <= 0) return null;

  // After order placed → hide
  if (location.pathname.includes("/orders")) return null;

  /* ================= UI ================= */

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* SAFE AREA SHADOW */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* BAR */}
      <div
        className="
          relative
          mx-2 mb-2
          rounded-2xl
          bg-black text-white
          px-4 py-3
          flex items-center justify-between
          shadow-2xl
          max-w-3xl
          lg:mx-auto
        "
      >
        {/* LEFT */}
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">
            {qty} item{qty > 1 ? "s" : ""}
          </span>
          <span className="text-xs text-white/70 transition-all duration-200">
            Total ₹{Math.round(total)}
          </span>
        </div>

        {/* ACTION */}
        <button
          onClick={() => navigate("../cart", { relative: "route" })}
          className="
            bg-emerald-600
            hover:bg-emerald-700
            active:scale-95
            transition
            px-5 py-2
            rounded-xl
            text-sm font-semibold
            shadow-md
          "
        >
          View Cart
        </button>
      </div>
    </div>
  );
}
