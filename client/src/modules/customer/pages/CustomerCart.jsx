import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";

import QuantityStepper from "../components/QuantityStepper";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "../../../store/customer/cartThunks";
import { placeOrder } from "../../../store/customer/orderThunks";
import {
  selectCartState,
  selectCartItems,
  selectTotalQty,
  selectTotalAmount,
  selectCartLoading,
} from "../../../store/customer/cartSelectors";

export default function CustomerCart() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const cart = useSelector(selectCartState);
  const items = useSelector(selectCartItems);
  const totalQty = useSelector(selectTotalQty);
  const totalAmount = useSelector(selectTotalAmount);
  const loading = useSelector(selectCartLoading);

  const [orderType, setOrderType] = useState("DINE_IN");
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(base, { replace: true });
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, sessionId, navigate, base]);

  const handlePlaceOrder = async () => {
    try {
      setIsPlacing(true);
      await dispatch(placeOrder()).unwrap();
      toast.success("Order sent to kitchen");
      navigate(base + "/orders");
    } catch (err) {
      toast.error(err || "Failed to place order");
    } finally {
      setIsPlacing(false);
    }
  };

  if (loading && !items.length) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Loader2
          className="w-8 h-8 text-slate-900 animate-spin mb-4"
          strokeWidth={1.5}
        />
        <p className="text-[11px] font-bold tracking-[0.3em] text-slate-400 uppercase">
          Syncing Cart
        </p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 ring-1 ring-slate-100">
          <UtensilsCrossed
            size={32}
            className="text-slate-200"
            strokeWidth={1}
          />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          Your cart is empty
        </h2>
        <p className="text-[15px] text-slate-500 mb-10 leading-relaxed font-medium">
          Add items from the menu to start your dining experience.
        </p>
        <button
          onClick={() => navigate(base + "/menu")}
          className="w-full max-w-xs h-14 bg-slate-900 text-white rounded-full font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          View Menu <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto font-sans text-slate-900">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl px-4 py-5 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 transition-colors border border-slate-100"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
          Review Order
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 px-5 py-8 pb-48">
        {/* 2. ORDER TYPE SWITCHER */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4 ml-1">
            Service Method
          </p>
          <div className="bg-slate-100/50 p-1.5 rounded-[22px] flex gap-1 ring-1 ring-slate-100">
            {["DINE_IN", "TAKEAWAY"].map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 py-3.5 rounded-[18px] text-[11px] font-bold uppercase tracking-widest transition-all ${
                  orderType === t
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* 3. ITEM LIST */}
        <div className="space-y-6 mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 ml-1">
            Your Selection
          </p>
          {items.map((it) => (
            <div
              key={it._id}
              className="relative flex justify-between items-start group animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-[17px] text-slate-900 tracking-tight leading-snug mb-1">
                  {it.name}
                </h3>
                <p className="text-[13px] font-semibold text-slate-400 mb-4">
                  ₹{Math.round(it.price)}
                </p>

                <div className="inline-block">
                  <QuantityStepper
                    value={it.quantity}
                    onAdd={() =>
                      dispatch(
                        updateCartItem({
                          cartItemId: it._id,
                          quantity: it.quantity + 1,
                        }),
                      )
                    }
                    onMinus={() => {
                      if (it.quantity <= 1) {
                        dispatch(removeCartItem(it._id));
                      } else {
                        dispatch(
                          updateCartItem({
                            cartItemId: it._id,
                            quantity: it.quantity - 1,
                          }),
                        );
                      }
                    }}
                  />
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="font-bold text-[17px] text-slate-900 mb-2">
                  ₹{Math.round(it.price * it.quantity)}
                </span>
                <button
                  onClick={() => dispatch(removeCartItem(it._id))}
                  className="p-2 -mr-2 text-slate-300 hover:text-red-500 transition-colors active:scale-90"
                >
                  <Trash2 size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4. BILLING SUMMARY */}
        <div className="bg-slate-50 rounded-[32px] p-8 ring-1 ring-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-6">
            Payment Summary
          </p>
          <div className="space-y-4">
            <Row
              label="Cart Subtotal"
              value={`₹${Math.round(cart.subtotal || 0)}`}
            />
            <Row
              label="Taxes & Charges"
              value={`₹${Math.round(cart.tax || 0)}`}
            />
            <div className="pt-6 mt-2 border-t border-slate-200/60 flex justify-between items-end">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Amount to pay
                </span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                  ₹{Math.round(totalAmount)}
                </span>
              </div>
              <div className="pb-1">
                <ShoppingBag size={24} className="text-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. BOTTOM CHECKOUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-5 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            disabled={isPlacing}
            onClick={handlePlaceOrder}
            className="w-full h-16 bg-slate-900 disabled:bg-slate-200 text-white rounded-[20px] flex items-center justify-between px-8 transition-all active:scale-[0.98] shadow-2xl shadow-slate-300 overflow-hidden relative"
          >
            {isPlacing && (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm z-10">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">
                Confirm Order
              </p>
              <p className="text-[15px] font-bold tracking-tight">
                {totalQty} {totalQty > 1 ? "Items" : "Item"} • ₹
                {Math.round(totalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-2 font-bold text-[13px] uppercase tracking-widest">
              Checkout <ChevronRight size={18} strokeWidth={3} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[14px] font-bold text-slate-900 tracking-tight">
        {value}
      </span>
    </div>
  );
}
