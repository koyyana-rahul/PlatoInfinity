import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export default function Modal({ title, children, onClose }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "relative bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl flex flex-col",
          "shadow-[0_35px_80px_-35px_rgba(2,6,23,0.65)] border border-gray-200 overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 bg-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-all active:scale-95"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-visible scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
