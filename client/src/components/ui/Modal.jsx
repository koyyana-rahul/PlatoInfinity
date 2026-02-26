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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL SHEET */}
      <div
        className={clsx(
          "relative bg-white w-full max-w-xl max-h-[85vh] rounded-2xl flex flex-col",
          "shadow-2xl border border-gray-200 overflow-hidden",
        )}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FC8019] to-[#FF6B35]">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
