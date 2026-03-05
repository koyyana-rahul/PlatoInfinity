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
  Sparkles,
  AlertCircle,
  Lock,
} from "lucide-react";

import QuantityStepper from "../components/QuantityStepper";
import CallWaiterModal from "../components/CallWaiterModal";
import CustomerPinInputModal from "../components/CustomerPinInputModal";
import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import { useCustomerSocket } from "../hooks/useCustomerSocket";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
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

  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const cart = useSelector(selectCartState);
  const items = useSelector(selectCartItems);
  const totalQty = useSelector(selectTotalQty);
  const totalAmount = useSelector(selectTotalAmount);
  const loading = useSelector(selectCartLoading);

  const [orderType, setOrderType] = useState("DINE_IN");

  // MODAL STATES
  const [showCallWaiterModal, setShowCallWaiterModal] = useState(false);
  const [showPinInputModal, setShowPinInputModal] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [pinError, setPinError] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // TABLE INFO
  const [tableNumber, setTableNumber] = useState("Table");
  const [restaurantId, setRestaurantId] = useState(null);

  useCustomerSocket({
    sessionId,
    restaurantId,
    tableId,
  });

  useEffect(() => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(base, { replace: true });
      return;
    }
    dispatch(fetchCart());

    // Load table info
    (async () => {
      try {
        const res = await Axios(customerApi.publicTable(tableId));
        if (res.data?.data?.tableNumber) {
          setTableNumber(res.data.data.tableNumber);
        }
        if (res.data?.data?.restaurantId) {
          setRestaurantId(res.data.data.restaurantId);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [dispatch, sessionId, navigate, base, tableId]);

  const handlePlaceOrderClick = () => {
    // Step 1: Show "Call Waiter" message
    setShowCallWaiterModal(true);
  };

  const handleWaiterConfirmed = () => {
    // Step 2: Waiter has given PIN, now show PIN input
    setPinError(null);
    setAttemptsLeft(null);
    setIsBlocked(false);
    setShowPinInputModal(true);
  };

  const handleSubmitOrder = async (pinData) => {
    try {
      setIsSubmittingOrder(true);
      setPinError(null);

      const payload = {
        tablePin: pinData.tablePin,
        mode: pinData.mode,
      };

      const res = await Axios({
        ...customerApi.order.place,
        data: payload,
      });

      if (res.data?.success) {
        toast.success("Order placed successfully! 🎉");
        setShowPinInputModal(false);
        setShowCallWaiterModal(false);
        navigate(base + "/orders");
      } else {
        setPinError(res.data?.message || "Failed to place order");
      }
    } catch (err) {
      const errorData = err?.response?.data;
      setPinError(errorData?.message || "Invalid PIN. Please try again.");
      setAttemptsLeft(errorData?.attemptsLeft);
      setIsBlocked(errorData?.isBlocked);
      toast.error(errorData?.message || "PIN verification failed");
    } finally {
      setIsSubmittingOrder(false);
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white flex flex-col font-sans text-slate-900 pb-40">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          {/* Header Top */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag size={20} className="flex-shrink-0" />
                Review Order
                <Sparkles size={16} className="text-orange-500 flex-shrink-0" />
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Table #{tableNumber}
              </p>
            </div>
            <div className="flex-shrink-0 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wide">
              {totalQty} items
            </div>
          </div>

          {/* KPI CARDS - Responsive Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center hover:border-slate-300 transition-colors">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
                Items
              </p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {totalQty}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-orange-600">
                Subtotal
              </p>
              <p className="text-lg sm:text-xl font-black text-orange-700 mt-1">
                ₹{Math.round(cart.subtotal || 0)}
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-600">
                Total
              </p>
              <p className="text-lg sm:text-xl font-black text-emerald-600 mt-1">
                ₹{Math.round(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* SERVICE METHOD SELECTOR */}
          <div className="mb-8">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-3">
              📍 Service Method
            </label>
            <div className="bg-slate-100/60 p-1.5 rounded-2xl flex gap-1.5 ring-1 ring-slate-200">
              {["DINE_IN", "TAKEAWAY"].map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
                    orderType === t
                      ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-300 scale-[1.02]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "DINE_IN" ? "🍽️ Dine In" : "🚚 Takeaway"}
                </button>
              ))}
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="mb-10">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              📦 Your Selection ({totalQty} items)
            </h2>
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex justify-between items-start"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate mb-1">
                      {it.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        ₹{Math.round(it.price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                        Qty: {it.quantity}
                      </span>
                    </div>
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

                  {/* RIGHT SIDE - PRICE & DELETE */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Subtotal</p>
                      <p className="text-lg sm:text-xl font-black text-slate-900">
                        ₹{Math.round(it.price * it.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(removeCartItem(it._id))}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT SUMMARY CARD */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 sm:p-8 ring-1 ring-slate-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                💳 Payment Breakdown
              </h3>
              <Lock size={16} className="text-slate-400" />
            </div>

            <div className="space-y-4">
              <BillingRow
                label="Cart Subtotal"
                value={`₹${Math.round(cart.subtotal || 0)}`}
                highlight={false}
              />
              <BillingRow
                label="Taxes & Charges"
                value={`₹${Math.round(cart.tax || 0)}`}
                highlight={false}
              />

              {/* TOTAL */}
              <div className="pt-5 mt-5 border-t-2 border-slate-300 flex justify-between items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                    Amount to Pay
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
                    ₹{Math.round(totalAmount)}
                  </p>
                </div>
                <div className="text-right pb-2">
                  <ShoppingBag
                    size={28}
                    className="text-emerald-200 opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle
                size={18}
                className="text-blue-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-xs">
                <p className="font-bold text-blue-900 mb-1">Secure Order</p>
                <p className="text-blue-800">
                  PIN protection keeps your order safe
                </p>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0">⚡</span>
              <div className="text-xs">
                <p className="font-bold text-emerald-900 mb-1">Quick Service</p>
                <p className="text-emerald-800">Order prepared in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. STICKY BOTTOM CHECKOUT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 sm:p-5 z-40">
        <div className="max-w-4xl mx-auto">
          <button
            disabled={isSubmittingOrder || !totalQty}
            onClick={handlePlaceOrderClick}
            className="w-full h-16 sm:h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-200 disabled:to-slate-200 text-white rounded-2xl sm:rounded-full flex items-center justify-between px-6 transition-all active:scale-95 shadow-lg hover:shadow-xl overflow-hidden relative font-bold text-sm sm:text-base"
          >
            {isSubmittingOrder && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Ready to Order
              </p>
              <p className="text-base sm:text-lg font-black tracking-tight">
                {totalQty} {totalQty > 1 ? "Items" : "Item"} • ₹
                {Math.round(totalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-2 font-bold uppercase">
              <span className="hidden xs:inline text-xs">Place Order</span>
              <ChevronRight size={20} strokeWidth={2.5} />
            </div>
          </button>

          {/* CONTINUE SHOPPING LINK */}
          <button
            onClick={() => navigate(base + "/menu")}
            className="w-full text-center text-xs sm:text-sm text-slate-500 hover:text-slate-700 py-3 font-semibold transition-colors"
          >
            ← Continue shopping
          </button>
        </div>
      </div>

      {/* MODALS */}
      <CallWaiterModal
        isOpen={showCallWaiterModal}
        tableNumber={tableNumber}
        tableId={tableId}
        restaurantId={restaurantId}
        onClose={() => setShowCallWaiterModal(false)}
        onWaiterConfirmed={handleWaiterConfirmed}
      />

      <CustomerPinInputModal
        isOpen={showPinInputModal}
        tableNumber={tableNumber}
        onClose={() => setShowPinInputModal(false)}
        onSubmit={handleSubmitOrder}
        isLoading={isSubmittingOrder}
        errorMessage={pinError}
        attemptsLeft={attemptsLeft}
        isBlocked={isBlocked}
      />
    </div>
  );
}

function BillingRow({ label, value, highlight = false }) {
  return (
    <div
      className={`flex justify-between items-center ${highlight ? "font-black" : ""}`}
    >
      <span
        className={`text-xs sm:text-sm font-${highlight ? "black" : "semibold"} uppercase tracking-wider ${highlight ? "text-slate-700" : "text-slate-600"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm sm:text-base font-${highlight ? "black" : "bold"} ${highlight ? "text-slate-900" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
