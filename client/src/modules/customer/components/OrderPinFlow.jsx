import { useState } from "react";
import { Lock, Loader2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OrderPinFlow = ({
  isVisible,
  onClose,
  onSubmit,
  isPlacing,
  isFirstOrder,
  mode,
  customerLabel,
  onCustomerLabelChange,
}) => {
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);

  const handleSubmit = () => {
    if (pin.length === 4) {
      onSubmit(pin);
    }
  };

  const handleClose = () => {
    setPin("");
    setShowPinInput(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-cream dark:bg-dark-surface w-full max-w-sm rounded-3xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!showPinInput ? (
              // "Call Waiter" view
              <div className="text-center">
                <ShieldAlert className="w-16 h-16 text-saffron mx-auto mb-4" />
                <h2 className="text-xl font-bold text-deep-green dark:text-cream mb-2">
                  Call Waiter for PIN
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  To confirm your order, please ask the waiter for the 4-digit table PIN.
                </p>
                <button
                  onClick={() => setShowPinInput(true)}
                  className="w-full h-12 bg-saffron text-white font-bold rounded-xl tap-scaling"
                >
                  I have the PIN
                </button>
              </div>
            ) : (
              // PIN Input view
              <div className="text-center">
                <Lock className="w-12 h-12 text-saffron mx-auto mb-4" />
                <h2 className="text-xl font-bold text-deep-green dark:text-cream mb-2">
                  Enter Table PIN
                </h2>
                {isFirstOrder && mode === "INDIVIDUAL" && (
                  <div className="my-4 text-left">
                    <label className="text-xs font-bold text-gray-500">Your Name (for Waiter)</label>
                    <input
                      type="text"
                      value={customerLabel}
                      onChange={onCustomerLabelChange}
                      placeholder="e.g., 'Person with glasses'"
                      className="w-full mt-1 px-4 py-3 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron"
                    />
                  </div>
                )}
                <div className="flex justify-center gap-2 my-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-14 rounded-lg flex items-center justify-center text-3xl font-bold border-2 ${
                        pin.length > i
                          ? "border-saffron"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {pin[i] || ""}
                    </div>
                  ))}
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="absolute opacity-0 w-0 h-0"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={pin.length !== 4 || isPlacing}
                  className="w-full h-12 bg-deep-green text-white font-bold rounded-xl tap-scaling disabled:opacity-50"
                >
                  {isPlacing ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Confirm Order"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderPinFlow;
