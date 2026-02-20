/**
 * Enhanced Customer Cart Page
 * - PIN entry before placing order
 * - Mode selection (SHARED/INDIVIDUAL) on first order
 * - Optional customer label for INDIVIDUAL mode
 * - Quantity fraud detection banner
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Loader2,
  UtensilsCrossed,
  AlertTriangle,
  Lock,
} from "lucide-react";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import QuantityStepper from "../components/QuantityStepper";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  placeOrder,
} from "../../../store/customer/cartThunks";
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

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const cart = useSelector(selectCartState);
  const items = useSelector(selectCartItems);
  const totalQty = useSelector(selectTotalQty);
  const totalAmount = useSelector(selectTotalAmount);
  const loading = useSelector(selectCartLoading);

  const [pin, setPin] = useState("");
  const [pinPromptVisible, setPinPromptVisible] = useState(false);
  const [pinEntryVisible, setPinEntryVisible] = useState(false);
  const [mode, setMode] = useState("FAMILY");
  const [customerLabel, setCustomerLabel] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(true);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const hasLargeQty = items.some((item) => item.quantity > 10);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("plato:deviceId");
    if (!deviceId) {
      deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("plato:deviceId", deviceId);
    }
    return deviceId;
  };

  const getStationBadge = (station) => {
    if (!station) return null;
    const normalized = String(station).toLowerCase();
    let icon = "🍽️";
    if (normalized.includes("tandoor") || normalized.includes("grill")) {
      icon = "🔥";
    } else if (
      normalized.includes("bar") ||
      normalized.includes("beverage") ||
      normalized.includes("drink")
    ) {
      icon = "🍹";
    } else if (normalized.includes("fry")) {
      icon = "🍟";
    } else if (normalized.includes("pizza") || normalized.includes("oven")) {
      icon = "🍕";
    } else if (normalized.includes("dessert")) {
      icon = "🍰";
    }
    return { icon, label: station };
  };

  const formatPreferences = (prefs) => {
    if (!prefs) return null;
    const chips = [];
    if (prefs.spiceLevel) chips.push(`Spice: ${prefs.spiceLevel}`);
    if (prefs.noOnion) chips.push("No onion");
    if (prefs.jain) chips.push("Jain");
    if (prefs.notes) chips.push(`Note: ${prefs.notes}`);
    return chips.length ? chips.join(" • ") : null;
  };

  const runningTabTotal = useMemo(
    () => ordersTotal + totalAmount,
    [ordersTotal, totalAmount],
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const loadOrdersSummary = async () => {
      try {
        setOrdersLoading(true);
        const deviceId = getDeviceId();
        const res = await Axios({
          ...customerApi.order.listByTable(tableId),
          headers: {
            "x-table-id": tableId,
            "x-device-id": deviceId,
          },
        });
        const data = res.data?.data || [];
        const orders = Array.isArray(data) ? data : [];
        setOrdersTotal(
          orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        );
        setIsFirstOrder(orders.length === 0);
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to load running tab",
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrdersSummary();
  }, [tableId]);

  const handlePlaceOrder = async () => {
    if (!pinEntryVisible) {
      setPinPromptVisible(true);
      return;
    }
    if (pin.length !== 4) {
      toast.error("Enter 4-digit PIN");
      return;
    }

    try {
      setIsPlacing(true);
      await dispatch(
        placeOrder({
          tablePin: pin,
          ...(isFirstOrder ? { mode, customerLabel } : {}),
        }),
      ).unwrap();
      setPin("");
      setPinEntryVisible(false);
      setPinPromptVisible(false);
      setCustomerLabel("");
      setShowModeSelector(false);
      setIsFirstOrder(false);
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white flex flex-col font-sans text-slate-900">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 transition-colors border border-slate-100"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-sm sm:text-base font-black uppercase tracking-[0.25em] text-slate-900">
            Review Order
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-40">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <section>
            {/* FRAUD WARNING */}
            {hasLargeQty && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                <AlertTriangle
                  size={20}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-1">
                    Large order detected
                  </p>
                  <p className="text-[13px] text-amber-700">
                    Quantities over 10 items require manager approval. Your
                    order will be pending.
                  </p>
                </div>
              </div>
            )}

            {/* ITEM LIST */}
            <div className="space-y-6 mb-10">
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
                    {(it.station || it.meta?.preferences) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStationBadge(it.station) && (
                          <span className="text-[10px] font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            {getStationBadge(it.station).icon}{" "}
                            {getStationBadge(it.station).label}
                          </span>
                        )}
                        {formatPreferences(it.meta?.preferences) && (
                          <span className="text-[10px] font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                            {formatPreferences(it.meta?.preferences)}
                          </span>
                        )}
                      </div>
                    )}

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
          </section>

          <aside className="space-y-8 lg:sticky lg:top-24 h-fit">
            {/* BILLING SUMMARY */}
            <div className="bg-white rounded-[28px] p-6 sm:p-8 ring-1 ring-slate-100 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.4)]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-6">
                Payment Summary
              </p>
              <div className="space-y-4">
                <Row
                  label="Subtotal"
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

            {/* RUNNING TAB */}
            <div className="bg-white rounded-[24px] p-5 ring-1 ring-slate-100 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.35)]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
                Running Tab
              </p>
              <div className="space-y-3">
                <Row
                  label="Previous orders"
                  value={
                    ordersLoading ? "…" : `₹${Math.round(ordersTotal || 0)}`
                  }
                />
                <Row
                  label="Current cart"
                  value={`₹${Math.round(totalAmount || 0)}`}
                />
                <div className="pt-4 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">
                    Total so far
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{Math.round(runningTabTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* PIN & MODE SECTION */}
            <div className="space-y-6">
              {/* MODE SELECTOR (FIRST ORDER ONLY) */}
              {isFirstOrder ? (
                !showModeSelector ? (
                  <button
                    onClick={() => setShowModeSelector(true)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    🪑 Order Mode:{" "}
                    {mode === "FAMILY" ? "Shared/Family" : "Individual"}
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      How would you like to order?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setMode("FAMILY");
                          setCustomerLabel("");
                          setShowModeSelector(false);
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-center font-bold text-[13px] ${
                          mode === "FAMILY"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                        }`}
                      >
                        👥 Shared
                        <p className="text-[10px] opacity-70 font-normal mt-1">
                          One bill
                        </p>
                      </button>
                      <button
                        onClick={() => {
                          setMode("INDIVIDUAL");
                          setShowModeSelector(false);
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-center font-bold text-[13px] ${
                          mode === "INDIVIDUAL"
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                        }`}
                      >
                        🧑 Individual
                        <p className="text-[10px] opacity-70 font-normal mt-1">
                          Separate
                        </p>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-sm font-semibold text-slate-700">
                  🧾 Order mode locked for this table
                </div>
              )}

              {/* CUSTOMER LABEL (INDIVIDUAL ONLY) */}
              {mode === "INDIVIDUAL" && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Your Identifier (optional)
                  </label>
                  <input
                    type="text"
                    value={customerLabel}
                    onChange={(e) =>
                      setCustomerLabel(e.target.value.slice(0, 20))
                    }
                    placeholder="e.g., Rahul, Blue Shirt"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Helps waiter identify you
                  </p>
                </div>
              )}

              {/* PIN PROMPT */}
              {pinPromptVisible && !pinEntryVisible && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-[12px] font-bold text-amber-900">
                    To place your order, call or wave for the waiter. They will
                    give you the Table PIN to submit.
                  </p>
                  <p className="text-[11px] text-amber-800 mt-2">
                    हिंदी: ऑर्डर देने के लिए वेटर को बुलाएँ। वे आपको टेबल PIN
                    बताएँगे।
                  </p>
                  <p className="text-[10px] text-amber-700 mt-2">
                    If phone issues, ask waiter to place order manually.
                  </p>
                  <button
                    onClick={() => setPinEntryVisible(true)}
                    className="mt-3 w-full h-11 bg-amber-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest"
                  >
                    I have the PIN
                  </button>
                </div>
              )}

              {/* PIN ENTRY */}
              {pinEntryVisible && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <Lock size={12} className="inline mr-1" /> Enter 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="w-full h-16 border-2 border-slate-900 rounded-xl text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-slate-700 placeholder-slate-300"
                    placeholder="••••"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">
                    Ask your waiter for the table PIN
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* BOTTOM CHECKOUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 sm:p-5 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="max-w-6xl mx-auto">
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
                {pinEntryVisible ? "Submit Order" : "Request PIN"}
              </p>
              <p className="text-[15px] font-bold tracking-tight">
                {totalQty} {totalQty > 1 ? "Items" : "Item"} • ₹
                {Math.round(totalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-2 font-bold text-[13px] uppercase tracking-widest">
              {pinEntryVisible ? "Submit" : "Call Waiter"}{" "}
              <ArrowRight size={18} strokeWidth={3} />
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
