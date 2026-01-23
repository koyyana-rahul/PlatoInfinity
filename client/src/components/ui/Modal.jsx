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
    /* HIGHEST Z-INDEX: Ensures we are above Admin Header (usually z-40 or z-50).
       FIXED INSET-0: Forces the blur to cover 100% of the browser window.
    */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* ================= BACKDROP (The Blur Layer) ================= */}
      <div
        className="
          fixed inset-0 
          bg-slate-900/60 
          backdrop-blur-[12px] 
          animate-in fade-in 
          duration-500
        "
        onClick={onClose}
      />

      {/* ================= MODAL SHEET ================= */}
      <div
        className={clsx(
          "relative bg-white/95 w-full max-w-xl max-h-[85vh] rounded-[32px] flex flex-col",
          "shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]",
          "border border-white/40 overflow-hidden",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        )}
      >
        {/* HEADER: High-Contrast Glassmorphism */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-black/[0.03] bg-white/40 backdrop-blur-xl sticky top-0 z-20">
          <div className="space-y-1">
            <h3 className="text-[12px] font-[900] text-black tracking-[0.2em] leading-none uppercase">
              {title}
            </h3>
            <div className="h-1 w-8 bg-emerald-500 rounded-full" />
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black hover:shadow-sm transition-all active:scale-75"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8 overflow-y-auto scrollbar-hide">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            {children}
          </div>
        </div>

        {/* FOOTER ACCENT */}
        <div className="h-4 w-full bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
