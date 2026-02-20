import { useState } from "react";
import { Phone, Hand, X } from "lucide-react";
import toast from "react-hot-toast";

/**
 * CallWaiterModal.jsx
 *
 * Shown when customer taps "Place Order"
 * Instructs customer to call/wave for waiter who will provide PIN
 * NO PIN INPUT HERE - just the message
 */
export default function CallWaiterModal({
  isOpen,
  tableNumber,
  onClose,
  onWaiterConfirmed,
}) {
  const [isWaiting, setIsWaiting] = useState(false);

  const handleCallWaiter = () => {
    setIsWaiting(true);
    toast.success("Waiter notified! They will come to your table shortly.", {
      duration: 4,
      icon: "👨‍🍳",
    });

    // After a brief moment, user can confirm waiter has arrived
    setTimeout(() => {
      setIsWaiting(false);
    }, 2000);
  };

  const handleWaiterArrived = () => {
    // Waiter has given PIN, now show PIN input modal
    onWaiterConfirmed();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-50">
            <span className="text-4xl">👋</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 text-center tracking-tight mb-2">
            Ready to Order?
          </h2>
          <p className="text-center text-slate-500 font-medium text-[15px]">
            Table {tableNumber}
          </p>
        </div>

        {/* MESSAGE */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* CALL OPTION */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center ring-2 ring-blue-100">
            <div className="text-3xl mb-2">📞</div>
            <p className="text-[13px] font-bold text-blue-900">Call Waiter</p>
            <p className="text-[11px] text-blue-700 mt-1">Use bell/buzzer</p>
          </div>

          {/* WAVE OPTION */}
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center ring-2 ring-green-100">
            <div className="text-3xl mb-2">🙋</div>
            <p className="text-[13px] font-bold text-green-900">
              Wave for Waiter
            </p>
            <p className="text-[11px] text-green-700 mt-1">Make eye contact</p>
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <p className="text-sm font-bold text-amber-900 leading-relaxed">
            📋 When the waiter arrives, they will:
          </p>
          <ol className="text-[13px] text-amber-800 mt-3 space-y-2 ml-4">
            <li>✓ Confirm your order from the cart</li>
            <li>
              ✓ Give you a <strong>4-digit PIN</strong> (verbally or on device)
            </li>
            <li>✓ You'll enter the PIN to submit</li>
          </ol>
        </div>

        {/* HINDI TRANSLATION */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
          <p className="text-[12px] text-slate-700 leading-relaxed font-medium">
            <strong>हिंदी:</strong> वेटर को बुलाएं। वे आपकी टेबल पर आएंगे और
            आपको एक 4-अंकीय PIN देंगे। आप PIN डालकर ऑर्डर देंगे।
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          <button
            onClick={handleCallWaiter}
            disabled={isWaiting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-200 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-[14px] uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <Phone size={20} />
            {isWaiting ? "Notified..." : "Call Waiter"}
          </button>

          <button
            onClick={handleWaiterArrived}
            disabled={isWaiting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-[14px] uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <Hand size={20} />
            Waiter Has Arrived
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-2xl transition-all text-[13px] uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>

        {/* NOTES */}
        <p className="text-center text-[11px] text-slate-400 mt-6 leading-relaxed">
          No PIN is required to browse or add items to cart.
          <br />
          PIN is only needed to <strong>submit</strong> the order.
        </p>
      </div>
    </div>
  );
}
