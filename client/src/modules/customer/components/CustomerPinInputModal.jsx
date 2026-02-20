import { useState, useRef, useEffect } from "react";
import { Lock, ArrowRight, Loader2, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

/**
 * CustomerPinInputModal.jsx
 *
 * Appears AFTER waiter gives PIN to customer
 * Customer enters 4-digit PIN to submit order
 * No modal on first load - only after waiter interaction
 */
export default function CustomerPinInputModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  errorMessage,
  attemptsLeft,
  isBlocked,
  tableNumber,
}) {
  const [pin, setPin] = useState("");
  const [selectedModifier, setSelectedModifier] = useState(null);
  const [showMode, setShowMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState("FAMILY");
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

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    try {
      await onSubmit({
        tablePin: pin,
        mode: selectedMode,
      });
      setPin("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const isBlacklisted = isBlocked;

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
            <Lock size={28} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight mb-2">
            Enter Table PIN
          </h2>
          <p className="text-center text-slate-500 text-[14px] font-medium">
            Table {tableNumber}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-bold text-red-900">{errorMessage}</p>
              {attemptsLeft !== undefined && (
                <p className="text-xs text-red-700 mt-1">
                  {attemptsLeft > 0
                    ? `${attemptsLeft} attempts remaining`
                    : "Too many attempts. Please try again later."}
                </p>
              )}
            </div>
          </div>
        )}

        {/* BLOCKED STATE */}
        {isBlacklisted && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-red-900 font-bold text-sm mb-2">
              Too many incorrect attempts
            </p>
            <p className="text-red-700 text-xs leading-relaxed">
              Please wait a few minutes or call your waiter for assistance.
            </p>
          </div>
        )}

        {!isBlacklisted && (
          <>
            {/* PIN INPUT GRID */}
            <div className="bg-slate-50 rounded-2xl p-8 mb-6 border border-slate-100">
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
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
              <p className="text-center text-xs text-slate-400 mt-4">
                Enter the 4-digit PIN given by your waiter
              </p>
            </div>

            {/* MODE SELECTOR (Only on first order) */}
            <div className="mb-6">
              <p className="text-[13px] font-bold text-slate-600 mb-3 uppercase tracking-wider">
                How would you like to split the bill?
              </p>
              <div className="space-y-2">
                <label
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  style={{
                    borderColor:
                      selectedMode === "FAMILY" ? "#10b981" : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="FAMILY"
                    checked={selectedMode === "FAMILY"}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-[14px]">
                      Shared/Family Bill
                    </p>
                    <p className="text-xs text-slate-500">
                      One merged bill for all customers at table
                    </p>
                  </div>
                </label>

                <label
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all"
                  style={{
                    borderColor:
                      selectedMode === "INDIVIDUAL" ? "#f97316" : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="mode"
                    value="INDIVIDUAL"
                    checked={selectedMode === "INDIVIDUAL"}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-[14px]">
                      Individual Bills
                    </p>
                    <p className="text-xs text-slate-500">
                      Separate bill per person (with optional name label)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || isLoading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[13px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Place Order <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* FOOTER NOTE */}
            <p className="text-center text-[11px] text-slate-400 mt-6">
              Your order will be sent to the kitchen once submitted.
              <br />
              You can track the status in real-time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
