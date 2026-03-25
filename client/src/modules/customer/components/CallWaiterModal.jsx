import { useEffect, useState } from "react";
import { Phone, Hand, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const formattedTableLabel = (() => {
    const raw = String(tableNumber || "").trim();
    if (!raw) return "Table";
    return /table/i.test(raw) ? raw : `Table #${raw}`;
  })();

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

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4"
        >
          {/* MODAL CONTAINER */}
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white rounded-t-[28px] md:rounded-3xl shadow-2xl w-full max-w-xl max-h-[88dvh] md:max-h-[90vh] overflow-y-auto ring-1 ring-slate-100 cmr-card"
          >
            <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />
            {/* HEADER - CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={22} className="text-slate-400" />
            </button>

            {/* CONTENT AREA */}
            <div className="p-4 sm:p-6 md:p-8">
              <div className="mb-6 text-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 ring-4 ring-amber-50 shadow-lg">
                  <span className="text-3xl sm:text-4xl">👨‍🍳</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Call Waiter
                </h1>
                <p className="text-sm text-slate-500 font-semibold">
                  <span className="text-slate-900 font-black">
                    {formattedTableLabel}
                  </span>
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  We’ll notify the staff and share a PIN to confirm your order.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    Step 1
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    Waiter arrives at your table
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    They’ll confirm the order with you.
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-orange-500 font-black">
                    Step 2
                  </p>
                  <p className="text-sm font-bold text-orange-900 mt-1">
                    Enter the 4-digit PIN
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Use the PIN to submit your order.
                  </p>
                </div>
              </div>

              {/* ESTIMATED WAIT TIME */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-6">
                <Clock size={20} className="text-blue-600 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-blue-900">
                    Expected wait: 2-3 minutes
                  </p>
                  <p className="text-blue-700">Waiter will arrive shortly</p>
                </div>
              </div>

              {/* ACTION BUTTONS - Full Width on Mobile, Grid on Desktop */}
              <div className="space-y-3">
                <button
                  onClick={handleCallWaiter}
                  disabled={isWaiting}
                  className="w-full bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] hover:brightness-105 disabled:from-slate-200 disabled:to-slate-200 text-white font-black py-3.5 sm:py-4 rounded-2xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                >
                  <Phone size={18} />
                  <span>{isWaiting ? "Notified... waiting" : "Call Waiter"}</span>
                </button>

                <button
                  onClick={handleWaiterArrived}
                  disabled={isWaiting}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-3 sm:py-4 rounded-2xl transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-md"
                >
                  <Hand size={18} />I have the PIN
                </button>

                <button
                  onClick={onClose}
                  disabled={isWaiting}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 sm:py-4 rounded-2xl transition-all text-xs sm:text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>

              <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-6 leading-relaxed">
                PIN is required only to submit the order.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
