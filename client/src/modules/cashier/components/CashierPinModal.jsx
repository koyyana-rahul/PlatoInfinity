import { useState, useRef, useEffect } from "react";
import { Lock, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * CashierPinModal.jsx
 *
 * Shown when cashier wants to close a bill
 * Requires 4-digit Staff PIN confirmation
 */
export default function CashierPinModal({
  isOpen,
  amount,
  paymentMethod,
  onClose,
  onConfirm,
  isLoading,
}) {
  const [pin, setPin] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handlePinInput = (digit, index) => {
    const newPin = pin.slice(0, index) + digit + pin.slice(index + 1);
    setPin(newPin);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.length === 4 && index === 3) {
      setTimeout(() => {
        handleSubmit(newPin);
      }, 200);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (pin[index]) {
        handlePinInput("", index);
      } else if (index > 0) {
        handlePinInput("", index - 1);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    handlePinInput(e.key, index);
  };

  const handleSubmit = async (pinValue = pin) => {
    if (pinValue.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    try {
      await onConfirm(pinValue);
      setPin("");
    } catch (err) {
      console.error(err);
      setPin("");
    }
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case "CASH":
        return "💵";
      case "UPI":
        return "📲";
      case "CARD":
        return "💳";
      default:
        return "💰";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* CLOSE */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-50">
            <span className="text-3xl">{getPaymentIcon()}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Confirm Payment
          </h2>
          <p className="text-slate-600 text-[14px] font-medium">
            {paymentMethod} Payment
          </p>
        </div>

        {/* AMOUNT */}
        <div className="bg-emerald-50 rounded-2xl p-6 mb-8 border border-emerald-200 text-center">
          <p className="text-xs text-emerald-700 font-bold uppercase mb-2">
            Total Amount
          </p>
          <p className="text-4xl font-black text-emerald-900">₹{amount || 0}</p>
        </div>

        {/* PIN INPUT */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-8 border border-slate-100">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[0, 1, 2, 3].map((idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="password"
                inputMode="numeric"
                maxLength="1"
                value={pin[idx] || ""}
                onChange={(e) => handlePinInput(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                disabled={isLoading}
                className="w-full h-16 text-center text-2xl font-black border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:bg-slate-100 disabled:opacity-50"
                placeholder="•"
              />
            ))}
          </div>
          <p className="text-center text-xs text-slate-400">
            Enter your 4-digit Staff PIN
          </p>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <button
            onClick={() => handleSubmit()}
            disabled={pin.length !== 4 || isLoading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[13px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={20} strokeWidth={3} />
                Complete Payment
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-900 font-bold py-3 rounded-2xl transition-all text-[13px] uppercase tracking-wider disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
