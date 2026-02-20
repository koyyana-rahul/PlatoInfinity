import { useState, useRef, useEffect } from "react";
import { Lock, X, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

/**
 * WaiterPinConfirmationModal.jsx
 *
 * Shown when waiter wants to mark an item as SERVED
 * Requires 4-digit Staff PIN confirmation
 */
export default function WaiterPinConfirmationModal({
  isOpen,
  itemName,
  tableName,
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

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-blue-50">
            <CheckCircle size={28} className="text-blue-600" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight mb-4">
            Mark as Served?
          </h2>

          {/* ITEM DETAILS */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-4 text-center">
            <p className="text-sm font-bold text-blue-900 mb-1">{itemName}</p>
            <p className="text-xs text-blue-700">For Table {tableName}</p>
          </div>

          <p className="text-center text-slate-600 text-[14px] font-medium">
            Confirm with your Staff PIN
          </p>
        </div>

        {/* PIN INPUT GRID */}
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
                className="w-full h-16 text-center text-2xl font-black border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100 disabled:opacity-50"
                placeholder="•"
              />
            ))}
          </div>
          <p className="text-center text-xs text-slate-400">
            Enter your 4-digit Staff PIN
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          <button
            onClick={() => handleSubmit()}
            disabled={pin.length !== 4 || isLoading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[13px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle size={20} strokeWidth={3} />
                Mark Served
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

        {/* SECURITY NOTE */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          <Lock size={14} className="inline mr-1" />
          PIN is required for delivery verification
        </p>
      </div>
    </div>
  );
}
