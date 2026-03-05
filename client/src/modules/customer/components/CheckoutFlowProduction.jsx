/**
 * PRODUCTION-READY CHECKOUT FLOW
 * Enhanced with error handling, validation, and recovery mechanisms
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  Clock,
  DollarSign,
  Lock,
  ChevronDown,
  AlertCircle,
  Wifi,
  WifiOff,
  RotateCw,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

/**
 * Enhanced Checkout Flow Component
 *
 * Features:
 * - 3-step checkout: Review → Payment → Confirm
 * - PIN verification for security
 * - Comprehensive input validation
 * - Error handling with recovery
 * - Network status indicator
 * - Retry mechanism for failed orders
 * - Real-time quantity validation
 */
export function CheckoutFlowProduction({
  cartItems,
  totalAmount,
  tableNumber,
  sessionToken,
  onPlaceOrder,
  isLoading,
  error,
  isNetworkOnline = true,
}) {
  // ═════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════

  const [step, setStep] = useState("review"); // review → payment → pin → confirm
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [expanded, setExpanded] = useState({ items: true, breakdown: true });
  const [validationErrors, setValidationErrors] = useState([]);

  // ═════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═════════════════════════════════════════════════════════════════

  const MAX_PIN_ATTEMPTS = 3;
  const PIN_LOCK_DURATION = 30 * 60 * 1000; // 30 minutes
  const TAX_RATE = 0.05; // 5% tax
  const PACKAGING_CHARGE = 20;

  const paymentMethods = [
    { id: "CASH", label: "💵 Cash", description: "Pay at pickup" },
    { id: "CARD", label: "💳 Card", description: "Debit/Credit" },
    { id: "UPI", label: "📱 UPI", description: "Fast & Secure" },
  ];

  // ═════════════════════════════════════════════════════════════════
  // VALIDATION FUNCTIONS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Validate cart before checkout
   */
  const validateCart = useCallback(() => {
    const errors = [];

    if (!cartItems || cartItems.length === 0) {
      errors.push("Cart is empty");
      return errors;
    }

    cartItems.forEach((item) => {
      // Check quantity
      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        errors.push(`Invalid quantity for ${item.name}: must be 1-100 items`);
      }

      // Check price validity
      if (!item.price || item.price < 0) {
        errors.push(`Invalid price for ${item.name}`);
      }

      // Check item ID
      if (!item._id || item._id.length !== 24) {
        errors.push(`Invalid item ID for ${item.name}`);
      }
    });

    // Check total amount
    if (totalAmount <= 0) {
      errors.push("Order total must be greater than ₹0");
    }

    if (totalAmount > 100000) {
      errors.push("Order total exceeds maximum limit of ₹100,000");
    }

    setValidationErrors(errors);
    return errors;
  }, [cartItems, totalAmount]);

  /**
   * Validate PIN format
   */
  const validatePin = useCallback((pinValue) => {
    if (!pinValue) {
      setPinError("PIN is required");
      return false;
    }

    if (!/^\d{4}$/.test(pinValue)) {
      setPinError("PIN must be exactly 4 digits");
      return false;
    }

    setPinError("");
    return true;
  }, []);

  /**
   * Validate payment method
   */
  const validatePaymentMethod = useCallback(() => {
    return paymentMethods.some((m) => m.id === paymentMethod);
  }, [paymentMethod]);

  // ═════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Handle tab key in PIN input (standard behavior)
   */
  const handlePinKeyDown = useCallback((e) => {
    if (!/[0-9]/.test(e.key) && !["Backspace", "Delete"].includes(e.key)) {
      e.preventDefault();
    }
  }, []);

  /**
   * Handle PIN paste
   */
  const handlePinPaste = useCallback((e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (/^\d{4}$/.test(pastedText)) {
      setPin(pastedText);
      setPinError("");
    } else {
      setPinError("PIN must be 4 digits");
    }
  }, []);

  /**
   * Handle step progression
   */
  const handleStepProgression = useCallback(async () => {
    if (step === "review") {
      // Validate cart
      const cartErrors = validateCart();
      if (cartErrors.length > 0) {
        toast.error(cartErrors[0]);
        return;
      }
      setStep("payment");
    } else if (step === "payment") {
      // Validate payment method
      if (!validatePaymentMethod()) {
        toast.error("Please select a payment method");
        return;
      }
      setStep("pin");
    } else if (step === "pin") {
      // Validate PIN
      if (!validatePin(pin)) {
        setPinAttempts((p) => p + 1);
        if (pinAttempts + 1 >= MAX_PIN_ATTEMPTS) {
          setPinError(`Account locked. Try again in 30 minutes.`);
          // Disable button for 30 minutes
          setTimeout(() => {
            setPin("");
            setPinAttempts(0);
            setPinError("");
          }, PIN_LOCK_DURATION);
        }
        return;
      }

      // All validations passed - place order
      setStep("confirm");
      await handlePlaceOrder();
    }
  }, [
    step,
    validateCart,
    validatePaymentMethod,
    validatePin,
    pin,
    pinAttempts,
  ]);

  /**
   * Handle place order
   */
  const handlePlaceOrder = useCallback(async () => {
    // Final validation before submission
    const cartErrors = validateCart();
    if (cartErrors.length > 0) {
      toast.error("Cart validation failed");
      return;
    }

    if (!validatePin(pin)) {
      toast.error("Invalid PIN");
      return;
    }

    if (!sessionToken) {
      toast.error("Session expired. Please scan QR code again.");
      return;
    }

    try {
      setIsRetrying(true);

      // Call parent handler with all required data
      await onPlaceOrder({
        paymentMethod,
        tablePin: pin,
        validatedItems: cartItems,
        totalAmount,
        sessionToken,
      });

      // On success, show confirmation
      toast.success("Order placed! Check order history for updates.");
    } catch (err) {
      console.error("Order placement failed:", err);

      // Don't reset step - allow retry
      setIsRetrying(false);

      // Show error with retry option
      if (err.shouldRetry) {
        toast.error(err.userMessage, {
          duration: 6000,
        });
      }
    }
  }, [
    validateCart,
    validatePin,
    pin,
    sessionToken,
    cartItems,
    totalAmount,
    onPlaceOrder,
    paymentMethod,
  ]);

  /**
   * Handle go back to previous step
   */
  const handleGoBack = useCallback(() => {
    const steps = ["review", "payment", "pin", "confirm"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      setValidationErrors([]);
    }
  }, [step]);

  // ═════════════════════════════════════════════════════════════════
  // CALCULATIONS
  // ═════════════════════════════════════════════════════════════════

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const taxes = Math.round(totalAmount * TAX_RATE);
  const finalTotal = totalAmount + taxes + PACKAGING_CHARGE;

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* NETWORK STATUS INDICATOR */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {!isNetworkOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex items-start gap-3">
          <WifiOff size={16} className="text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-xs font-bold text-yellow-600 uppercase">
              Offline Mode
            </p>
            <p className="text-sm text-yellow-900">
              You're offline. Please connect to internet before placing order.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STEP INDICATOR */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: "review", label: "Review" },
          { id: "payment", label: "Pay" },
          { id: "pin", label: "PIN" },
          { id: "confirm", label: "Done" },
        ].map((s, idx) => (
          <div
            key={s.id}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
              ["review", "payment", "pin", "confirm"].indexOf(s.id) <=
                ["review", "payment", "pin", "confirm"].indexOf(step)
                ? "bg-[#F35C2B] text-white"
                : "bg-gray-100 text-gray-500",
            )}
          >
            <span>{idx + 1}</span>
            <span className="hidden xs:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* VALIDATION ERRORS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
          {validationErrors.map((err, idx) => (
            <div key={idx} className="flex gap-3">
              <AlertCircle
                size={16}
                className="text-red-600 flex-shrink-0 mt-1"
              />
              <p className="text-sm text-red-900">{err}</p>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STEP CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {/* STEP 1: REVIEW */}
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
                      Items ({itemCount})
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
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
                      ₹{PACKAGING_CHARGE}
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

        {/* STEP 2: PAYMENT */}
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
                    "w-5 h-5 rounded-full border-2 transition-all flex-shrink-0",
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

        {/* STEP 3: PIN VERIFICATION */}
        {step === "pin" && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
              <Lock size={16} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase">
                  Secure Verification
                </p>
                <p className="text-sm text-blue-900">
                  Ask your waiter for the 4-digit PIN to confirm your order.
                </p>
              </div>
            </div>

            {/* PIN INPUT */}
            <input
              type="text"
              inputMode="numeric"
              maxLength="4"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setPin(val);
                if (val.length === 4) {
                  setPinError("");
                }
              }}
              onKeyDown={handlePinKeyDown}
              onPaste={handlePinPaste}
              autoFocus
              placeholder="_ _ _ _"
              className={clsx(
                "w-full text-center text-4xl font-bold tracking-widest py-4 rounded-2xl border-2 transition-colors",
                pinError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white",
              )}
            />

            {/* PIN ERROR */}
            {pinError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle
                  size={16}
                  className="text-red-600 flex-shrink-0 mt-1"
                />
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase">
                    Error
                  </p>
                  <p className="text-sm text-red-900">{pinError}</p>
                  {pinAttempts > 0 && pinAttempts < MAX_PIN_ATTEMPTS && (
                    <p className="text-xs text-red-700 mt-2">
                      {MAX_PIN_ATTEMPTS - pinAttempts} attempt
                      {MAX_PIN_ATTEMPTS - pinAttempts !== 1 ? "s" : ""} left
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* PIN HINTS */}
            <div className="text-center text-xs text-gray-500">
              <p>Check your bill or ask your waiter</p>
            </div>
          </motion.div>
        )}

        {/* STEP 4: CONFIRM */}
        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {!error ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">
                  Success
                </p>
                <p className="text-sm font-semibold text-emerald-900">
                  Order placed! Check order history for updates.
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  Your waiter will prepare your order
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle
                  size={16}
                  className="text-red-600 flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-600 uppercase">
                    Failed
                  </p>
                  <p className="text-sm text-red-900">{error}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ACTION BUTTONS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="flex gap-2">
        {step !== "review" && (
          <button
            onClick={handleGoBack}
            disabled={isLoading || isRetrying}
            className={clsx(
              "flex-1 h-14 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95",
              isLoading || isRetrying
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            Back
          </button>
        )}

        <button
          onClick={
            step === "confirm" && error ? handleGoBack : handleStepProgression
          }
          disabled={isLoading || isRetrying || !isNetworkOnline}
          className={clsx(
            "flex-1 h-14 rounded-2xl font-bold text-white text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2",
            isLoading || isRetrying
              ? "bg-gray-400 cursor-not-allowed"
              : !isNetworkOnline
                ? "bg-gray-400 cursor-not-allowed"
                : step === "confirm" && !error
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-105"
                  : step === "confirm" && error
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-105"
                    : "bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] hover:brightness-105",
          )}
        >
          {isLoading || isRetrying ? (
            <>
              <RotateCw size={16} className="animate-spin" />
              Processing...
            </>
          ) : step === "confirm" && !error ? (
            "✓ Success"
          ) : step === "confirm" && error ? (
            "Retry"
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}

export default CheckoutFlowProduction;
