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
          w-full h-11 px-3.5
          flex items-center justify-between
          border rounded-xl bg-white text-sm text-gray-900
          hover:border-[#FC8019]/60 transition-all
          focus:outline-none focus:ring-2 focus:ring-[#FC8019]/30 focus:border-[#FC8019]
        "
      >
        <span
          className={`min-w-0 flex-1 truncate pr-2 ${selected ? "text-gray-900" : "text-gray-400"}`}
        >
          {selected?.label || placeholder}
        </span>
        <FiChevronDown
          className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* MENU */}
      {open && (
        <div
          className="
            absolute z-[400] w-full
            bg-white border border-gray-200 rounded-xl shadow-[0_16px_36px_-18px_rgba(2,6,23,0.4)]
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
                w-full text-left px-3.5 py-2.5 text-sm flex items-center
                hover:bg-orange-50 transition-colors
                ${
                  opt.value === value
                    ? "bg-orange-100/70 text-[#FC8019] font-medium"
                    : "text-gray-700"
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
