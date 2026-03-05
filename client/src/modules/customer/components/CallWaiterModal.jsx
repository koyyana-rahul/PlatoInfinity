import { useState } from "react";
import { Phone, Hand, X, Clock, AlertCircle, ZapOff } from "lucide-react";
import toast from "react-hot-toast";
import {
  emitCustomerSocketEvent,
  ensureCustomerSocketConnection,
} from "../hooks/useCustomerSocket";

/**
 * CallWaiterModal.jsx
 *
 * Shown when customer taps "Place Order"
 * Instructs customer to call/wave for waiter who will provide PIN
 * Fully responsive for mobile, tablet, and desktop
 */
export default function CallWaiterModal({
  isOpen,
  tableNumber,
  tableId,
  restaurantId,
  sessionId,
  onClose,
  onWaiterConfirmed,
}) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCallWaiter = async () => {
    console.log("📞 Call waiter clicked", {
      tableId,
      restaurantId,
      tableNumber,
      sessionId,
    });

    if (!restaurantId || !tableId) {
      console.error("❌ Missing required fields:", { restaurantId, tableId });
      toast.error("Unable to notify waiter. Missing table information.");
      return;
    }

    setIsWaiting(true);

    try {
      console.log("🔌 Ensuring socket connection...");
      const connected = await ensureCustomerSocketConnection({
        sessionId,
        restaurantId,
        tableId,
      });

      if (!connected) {
        console.error("❌ Socket connection failed");
        toast.error(
          "Unable to reach waiter. Please check your connection and try again.",
        );
        setIsWaiting(false);
        return;
      }

      console.log("✅ Socket connected, emitting waiter call...");
      const notified = await emitCustomerSocketEvent(
        "table:call_waiter",
        {
          restaurantId: String(restaurantId),
          tableId: String(tableId),
          tableName: tableNumber,
          reason: "TABLE_PIN_REQUEST",
        },
        (response) => {
          console.log("📬 Waiter call ack:", response);
          if (response?.ok === false) {
            console.error("❌ Server rejected call:", response.error);
            toast.error(response?.error || "Failed to notify waiter");
            setIsWaiting(false);
          }
        },
      );

      if (!notified) {
        console.error("❌ Failed to emit event");
        toast.error(
          "Unable to reach waiter. Please try again or call them directly.",
        );
        setIsWaiting(false);
        return;
      }

      console.log("✅ Waiter notification sent successfully");
      toast.success(
        "Waiter notified! ✓ They will come to your table shortly.",
        {
          duration: 4,
          icon: "👨‍🍳",
        },
      );

      setTimeout(() => {
        setIsWaiting(false);
      }, 2000);
    } catch (error) {
      console.error("❌ Unexpected error in handleCallWaiter:", error);
      toast.error("Something went wrong. Please try again or contact staff.");
      setIsWaiting(false);
    }
  };

  const handleWaiterArrived = () => {
    // Waiter has given PIN, now show PIN input modal
    onWaiterConfirmed();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
      {/* MODAL CONTAINER - Responsive for all screen sizes */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300 ring-1 ring-slate-100">
        {/* HEADER - CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={22} className="text-slate-400" />
        </button>

        {/* CONTENT AREA */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* HEADER SECTION */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ring-4 ring-amber-50 shadow-lg">
              <span className="text-3xl sm:text-4xl">👨‍🍳</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Call Waiter
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-semibold">
              Table{" "}
              <span className="text-slate-900 font-black text-lg">
                #{tableNumber}
              </span>
            </p>
          </div>

          {/* TWO COLUMN LAYOUT - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* LEFT COLUMN - Communication Methods */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                How to Call
              </h3>

              {/* CALL OPTION */}
              <div className="bg-blue-50 rounded-2xl p-3 sm:p-4 border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-2">📞</div>
                <p className="text-sm sm:text-base font-bold text-blue-900">
                  Use Bell / Buzzer
                </p>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Press the bell button at your table
                </p>
              </div>

              {/* WAVE OPTION */}
              <div className="bg-green-50 rounded-2xl p-3 sm:p-4 border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-2">🙋</div>
                <p className="text-sm sm:text-base font-bold text-green-900">
                  Wave for Waiter
                </p>
                <p className="text-xs sm:text-sm text-green-700 mt-1">
                  Make eye contact & wave
                </p>
              </div>

              {/* APP CALL OPTION */}
              <div className="bg-purple-50 rounded-2xl p-3 sm:p-4 border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                <div className="text-2xl sm:text-3xl mb-2">📱</div>
                <p className="text-sm sm:text-base font-bold text-purple-900">
                  Digital Alert
                </p>
                <p className="text-xs sm:text-sm text-purple-700 mt-1">
                  Send app notification
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN - Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                What Happens Next
              </h3>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex gap-3">
                  <div className="text-xl flex-shrink-0">📋</div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-900">
                      Step 1: Confirmation
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Waiter confirms your order
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="text-xl flex-shrink-0">🔐</div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-900">
                      Step 2: PIN Code
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Receive 4-digit PIN
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="text-xl flex-shrink-0">✅</div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-900">
                      Step 3: Submit
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Enter PIN to submit order
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ESTIMATED WAIT TIME */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
            <Clock size={20} className="text-blue-600 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-blue-900">
                Expected wait: 2-3 minutes
              </p>
              <p className="text-blue-700">Waiter will arrive soon</p>
            </div>
          </div>

          {/* ACTION BUTTONS - Full Width on Mobile, Grid on Desktop */}
          <div className="space-y-3 sm:space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3 mb-6 sm:mb-8">
            {/* PRIMARY: Call Waiter */}
            <button
              onClick={handleCallWaiter}
              disabled={isWaiting}
              className="w-full col-span-1 md:col-span-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-200 disabled:to-blue-200 text-white font-bold py-3.5 sm:py-4 rounded-2xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
            >
              <Phone size={20} />
              <span>
                {isWaiting
                  ? "Notified... Waiting for Waiter"
                  : "Send Alert to Waiter"}
              </span>
            </button>

            {/* SECONDARY: Waiter Arrived */}
            <button
              onClick={handleWaiterArrived}
              disabled={isWaiting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white font-bold py-3 sm:py-4 rounded-2xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Hand size={18} />
              <span className="hidden sm:inline">Waiter Here</span>
              <span className="sm:hidden">Ready</span>
            </button>

            {/* TERTIARY: Cancel */}
            <button
              onClick={onClose}
              disabled={isWaiting}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 sm:py-4 rounded-2xl transition-all text-xs sm:text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>

          {/* EXPANDABLE DETAILS SECTION */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-700 py-2 transition-colors"
          >
            {showDetails ? "Hide Details ▲" : "Show More Info ▼"}
          </button>

          {/* COLLAPSIBLE DETAILS */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              {/* HINDI TRANSLATION */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">
                  हिंदी (Hindi):
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  वेटर को बुलाएं। वे आपकी टेबल पर आएंगे, आपका ऑर्डर कन्फर्म
                  करेंगे और आपको एक 4-अंकीय PIN देंगे। आप PIN डालकर ऑर्डर सबमिट
                  करेंगे।
                </p>
              </div>

              {/* FAQ */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  ❓ Common Questions
                </p>

                <div className="text-xs">
                  <p className="font-semibold text-slate-700">
                    Q: What if waiter doesn't come?
                  </p>
                  <p className="text-slate-600 mt-1">
                    Try calling again or motion to any staff member.
                  </p>
                </div>

                <div className="text-xs">
                  <p className="font-semibold text-slate-700">
                    Q: Is PIN mandatory?
                  </p>
                  <p className="text-slate-600 mt-1">
                    Yes, PIN prevents unauthorized orders from your table.
                  </p>
                </div>

                <div className="text-xs">
                  <p className="font-semibold text-slate-700">
                    Q: Can I modify order later?
                  </p>
                  <p className="text-slate-600 mt-1">
                    Contact waiter - they can assist with changes.
                  </p>
                </div>
              </div>

              {/* SAFETY NOTE */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Your data is secure. PIN is only for
                  order confirmation.
                </p>
              </div>
            </div>
          )}

          {/* FOOTER NOTE */}
          <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-6 leading-relaxed">
            No PIN required to browse menu or add items.
            <br />
            PIN only needed to <strong>submit</strong> the order.
          </p>
        </div>
      </div>
    </div>
  );
}
