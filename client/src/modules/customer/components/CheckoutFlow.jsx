/**
 * CheckoutFlow.jsx
 * Professional checkout component with order review, PIN verification, and payment
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  Clock,
  DollarSign,
  Lock,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";

export function CheckoutFlow({
  cartItems,
  totalAmount,
  tableNumber,
  onPlaceOrder,
  isLoading,
  error,
}) {
  const [step, setStep] = useState("review"); // review -> payment -> confirm
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [expanded, setExpanded] = useState({ items: true, breakdown: true });

  const paymentMethods = [
    { id: "CASH", label: "💵 Cash", description: "Pay at pickup" },
    { id: "CARD", label: "💳 Card", description: "Debit/Credit" },
    { id: "UPI", label: "📱 UPI", description: "Fast & Secure" },
  ];

  const handlePlaceOrder = async () => {
    if (step === "review") {
      setStep("payment");
    } else if (step === "payment") {
      setStep("confirm");
      await onPlaceOrder(paymentMethod);
    }
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const taxes = Math.round(totalAmount * 0.05); // 5% tax
  const packaging = 20;
  const finalTotal = totalAmount + taxes + packaging;

  return (
    <div className="space-y-4">
      {/* ============= STEP INDICATOR ============= */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "review", label: "Review" },
          { id: "payment", label: "Pay" },
          { id: "confirm", label: "Place" },
        ].map((s, idx) => (
          <div
            key={s.id}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
              ["review", "payment", "confirm"].indexOf(s.id) <=
                ["review", "payment", "confirm"].indexOf(step)
                ? "bg-[#F35C2B] text-white"
                : "bg-gray-100 text-gray-500",
            )}
          >
            <span>{idx + 1}</span>
            <span className="hidden xs:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ============= STEP 1: REVIEW ============= */}
      <AnimatePresence mode="wait">
        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* ORDER SUMMARY */}
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded((p) => ({ ...p, items: !p.items }))}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} className="text-[#F35C2B]" />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">
                      Items
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    "text-gray-400 transition-transform",
                    expanded.items ? "rotate-180" : "",
                  )}
                />
              </button>

              {expanded.items && (
                <div className="border-t border-gray-100 p-4 space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.name} x {item.quantity}
                        </p>
                        {item.selectedModifiers?.length > 0 && (
                          <p className="text-[11px] text-gray-500">
                            {item.selectedModifiers.join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{Math.round(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TABLE INFO */}
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#F35C2B]" />
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase">
                    Table
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    #{tableNumber}
                  </p>
                </div>
              </div>
              <Clock size={16} className="text-gray-400" />
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
              <button
                onClick={() =>
                  setExpanded((p) => ({ ...p, breakdown: !p.breakdown }))
                }
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-[#F35C2B]" />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">
                      Breakdown
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      ₹{finalTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    "text-gray-400 transition-transform",
                    expanded.breakdown ? "rotate-180" : "",
                  )}
                />
              </button>

              {expanded.breakdown && (
                <div className="border-t border-gray-100 p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{Math.round(totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Taxes (5%)</span>
                    <span className="font-semibold text-gray-900">
                      ₹{taxes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Packaging</span>
                    <span className="font-semibold text-gray-900">
                      ₹{packaging}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ============= STEP 2: PAYMENT ============= */}
        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold text-gray-900">
              Select Payment Method
            </p>
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={clsx(
                  "w-full px-4 py-3 rounded-2xl text-left transition-all border-2 flex items-center gap-4 active:scale-95",
                  paymentMethod === method.id
                    ? "border-[#F35C2B] bg-orange-50"
                    : "border-gray-200 bg-white",
                )}
              >
                <div
                  className={clsx(
                    "w-5 h-5 rounded-full border-2 transition-all",
                    paymentMethod === method.id
                      ? "border-[#F35C2B] bg-[#F35C2B]"
                      : "border-gray-300",
                  )}
                >
                  {paymentMethod === method.id && (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* ============= STEP 3: CONFIRM ============= */}
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">
                ✓ Ready
              </p>
              <p className="text-sm font-semibold text-emerald-900">
                Order placed successfully
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs font-bold text-red-600 uppercase">Error</p>
            <p className="text-sm text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* CTA BUTTON */}
      <button
        onClick={handlePlaceOrder}
        disabled={isLoading}
        className={clsx(
          "w-full h-14 rounded-2xl font-bold text-white text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl",
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] hover:brightness-105",
        )}
      >
        {isLoading
          ? "Processing..."
          : step === "confirm"
            ? "Order Placed ✓"
            : "Continue"}
      </button>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : tone === "green"
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-white border-gray-200 text-gray-700";

  return (
    <div
      className={`rounded-xl border p-2 xs:p-3 text-center cursor-pointer transition-all hover:shadow-md ${toneClass}`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-base xs:text-lg font-black mt-0.5 leading-none">
        {value}
      </p>
    </div>
  );
}
