import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedMenuHeight = Math.min(options.length * 44 + 8, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setOpenUp(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow);
  }, [open, options.length]);

  return (
    <div ref={ref} className="relative w-full">
      {/* BUTTON */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="
          w-full h-11 px-4
          flex items-center justify-between
          border border-slate-200 rounded-2xl bg-white text-sm text-slate-900
          shadow-sm hover:shadow-md hover:border-[#FC8019]/60 transition-all
          focus:outline-none focus:ring-2 focus:ring-[#FC8019]/25 focus:border-[#FC8019]
        "
      >
        <span
          className={`min-w-0 flex-1 truncate pr-2 ${selected ? "text-slate-900" : "text-slate-400"}`}
        >
          {selected?.label || placeholder}
        </span>
        <FiChevronDown
          className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* MENU */}
      {open && (
        <div
          className="
            absolute z-[400] left-0 right-0
            w-full max-w-[calc(100vw-2rem)]
            bg-white border border-slate-200 rounded-2xl
            shadow-[0_20px_50px_-24px_rgba(2,6,23,0.45)]
            max-h-[min(18rem,42vh)] overflow-y-auto overscroll-contain overflow-x-hidden
          "
          style={
            openUp
              ? { bottom: "calc(100% + 0.5rem)" }
              : { top: "calc(100% + 0.5rem)" }
          }
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2.5 text-sm flex items-center
                hover:bg-orange-50 transition-colors
                ${
                  opt.value === value
                    ? "bg-orange-100/70 text-[#FC8019] font-semibold"
                    : "text-slate-700"
                }
              `}
              title={opt.label}
            >
              <span className="block w-full truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
