import { X, Loader2, ChefHat, Check, UtensilsCrossed } from "lucide-react";

/**
 * ChefStatusConfirmationModal.jsx
 *
 * Universal confirmation modal for chef status changes
 * - IN_PROGRESS: Start cooking
 * - READY: Mark as ready → Alerts waiter
 * - SERVED: Mark as served
 */

const STATUS_CONFIG = {
  IN_PROGRESS: {
    title: "Start Cooking?",
    description: "This will mark the item as being prepared",
    icon: ChefHat,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    ringColor: "ring-orange-50",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-900",
    buttonBg: "bg-orange-600",
    buttonHover: "hover:bg-orange-700",
    focusBorder: "focus:border-orange-500",
    focusRing: "focus:ring-orange-200",
    action: "Start Cooking",
  },
  READY: {
    title: "Mark as Ready?",
    description: "This will notify the waiter to serve this item",
    icon: Check,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    ringColor: "ring-emerald-50",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-900",
    buttonBg: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-700",
    focusBorder: "focus:border-emerald-500",
    focusRing: "focus:ring-emerald-200",
    action: "Mark Ready",
  },
  SERVED: {
    title: "Mark as Served?",
    description: "This will complete this item",
    icon: UtensilsCrossed,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    ringColor: "ring-blue-50",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    buttonBg: "bg-blue-600",
    buttonHover: "hover:bg-blue-700",
    focusBorder: "focus:border-blue-500",
    focusRing: "focus:ring-blue-200",
    action: "Mark Served",
  },
};

const formatTableNo = (tableName) => {
  const raw = String(tableName || "Unknown").trim();
  return raw.replace(/^table\s*/i, "").trim();
};

export default function ChefStatusConfirmationModal({
  isOpen,
  status, // "IN_PROGRESS" | "READY" | "SERVED"
  itemName,
  tableName,
  onClose,
  onConfirm,
  isLoading,
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.READY;
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm(status);
    } catch (err) {
      console.error(err);
      // Error toast handled by parent
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-8 relative animate-in zoom-in duration-300 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          type="button"
        >
          <X size={20} className="text-slate-400" />
        </button>

        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ${config.ringColor}`}
          >
            <Icon size={24} className={`${config.iconColor} sm:hidden`} strokeWidth={2.5} />
            <Icon size={28} className={`${config.iconColor} hidden sm:block`} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center tracking-tight mb-4">
            {config.title}
          </h2>

          {/* ITEM DETAILS */}
          <div
            className={`${config.bgColor} rounded-2xl p-4 border ${config.borderColor} mb-4 text-center`}
          >
            <p className={`text-sm font-bold ${config.textColor} mb-1`}>
              {itemName}
            </p>
            <p className={`text-xs ${config.textColor} opacity-80`}>
              Table {formatTableNo(tableName)}
            </p>
          </div>

          <p className="text-center text-slate-600 text-[14px] font-medium mb-2">
            {config.description}
          </p>
          <p className="text-center text-slate-500 text-sm">
            Are you sure you want to proceed?
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading || !status}
            className={`w-full h-12 sm:h-14 ${config.buttonBg} ${config.buttonHover} disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[12px] sm:text-[13px]`}
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon size={20} strokeWidth={3} />
                Confirm {config.action}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-900 font-bold py-3 rounded-2xl transition-all text-[12px] sm:text-[13px] uppercase tracking-wider disabled:opacity-50"
            type="button"
          >
            Cancel
          </button>
        </div>

        {/* SECURITY NOTE */}
        {status === "READY" && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-center text-xs text-amber-800 font-medium">
              ⚡ Waiter will be alerted immediately
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
