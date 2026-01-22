// // src/modules/customer/components/StickyCartBar.jsx
// import { useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";

// import {
//   selectTotalQty,
//   selectTotalAmount,
// } from "../../../store/customer/cartSelectors";

// export default function StickyCartBar() {
//   const qty = useSelector(selectTotalQty);
//   const total = useSelector(selectTotalAmount);

//   const navigate = useNavigate();
//   const location = useLocation();

//   /* ================= GUARDS ================= */

//   // No cart → hide
//   if (!qty || qty <= 0) return null;

//   // After order placed → hide
//   if (location.pathname.includes("/orders")) return null;

//   /* ================= UI ================= */

//   return (
//     <div className="fixed bottom-0 left-0 right-0 z-50">
//       {/* SAFE AREA SHADOW */}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

//       {/* BAR */}
//       <div
//         className="
//           relative
//           mx-2 mb-2
//           rounded-2xl
//           bg-black text-white
//           px-4 py-3
//           flex items-center justify-between
//           shadow-2xl
//           max-w-3xl
//           lg:mx-auto
//         "
//       >
//         {/* LEFT */}
//         <div className="flex flex-col leading-tight">
//           <span className="text-sm font-semibold">
//             {qty} item{qty > 1 ? "s" : ""}
//           </span>
//           <span className="text-xs text-white/70 transition-all duration-200">
//             Total ₹{Math.round(total)}
//           </span>
//         </div>

//         {/* ACTION */}
//         <button
//           onClick={() => navigate("../cart", { relative: "route" })}
//           className="
//             bg-emerald-600
//             hover:bg-emerald-700
//             active:scale-95
//             transition
//             px-5 py-2
//             rounded-xl
//             text-sm font-semibold
//             shadow-md
//           "
//         >
//           View Cart
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  X,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";

import {
  selectTotalQty,
  selectTotalAmount,
  selectCartItems,
} from "../../../store/customer/cartSelectors";

export default function StickyCartBar() {
  const [isOpen, setIsOpen] = useState(false);

  const qty = useSelector(selectTotalQty);
  const total = useSelector(selectTotalAmount);
  const cartItems = useSelector(selectCartItems);

  const navigate = useNavigate();
  const location = useLocation();

  const isHidden =
    !qty ||
    qty <= 0 ||
    location.pathname.includes("/orders") ||
    location.pathname.includes("/cart");
  if (isHidden) return null;

  return (
    <>
      {/* 1. THE TRIGGER BAR (Compact & Premium) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-0 right-0 z-40 px-6 pointer-events-none"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="max-w-md mx-auto w-full h-16 bg-slate-900 rounded-[22px] flex items-center justify-between px-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] pointer-events-auto active:scale-[0.97] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-emerald-500 p-2.5 rounded-xl">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span className="absolute -top-2 -right-2 bg-white text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                {qty}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em] leading-none mb-1">
                Your Basket
              </p>
              <p className="text-base font-black text-white leading-none">
                ₹{total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 py-2 px-4 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Review
            </span>
            <ChevronRight size={14} className="text-emerald-400" />
          </div>
        </button>
      </motion.div>

      {/* 2. THE MINI SLIDE-UP SHEET */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
            />

            {/* THE SHEET */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[60] rounded-t-[3rem] shadow-2xl flex flex-col max-h-[70vh]"
            >
              {/* HEADER AREA */}
              <div className="sticky top-0 bg-white rounded-t-[3rem] z-10">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
                <div className="px-8 py-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-slate-900 text-lg tracking-tighter">
                      Your Selection
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {qty} Items added
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* ITEM LIST (Staggered Children) */}
              <div className="px-8 overflow-y-auto no-scrollbar py-2 flex-1">
                <div className="space-y-6">
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex justify-between items-center group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] font-bold text-slate-400">
                            ₹{item.price}
                          </span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                            Qty {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          ₹{item.quantity * item.price}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* FOOTER (Glassmorphism Effect) */}
              <div className="p-8 pt-6 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                      Subtotal
                    </p>
                    <p className="text-2xl font-black text-slate-900 leading-none">
                      ₹{total.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 italic">
                    Taxes calculated at checkout
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("../cart");
                  }}
                  className="w-full bg-slate-900 hover:bg-black h-16 rounded-[20px] flex items-center justify-between px-8 text-white shadow-xl active:scale-[0.98] transition-all"
                >
                  <span className="font-black uppercase text-xs tracking-[0.2em]">
                    Proceed to Cart
                  </span>
                  <div className="bg-emerald-500 rounded-lg p-1.5">
                    <ArrowRight size={18} />
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
