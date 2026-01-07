import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  return (
    <div ref={ref} className="relative w-full">
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="
          w-full h-11 px-3
          flex items-center justify-between
          border rounded-lg bg-white text-sm
          focus:outline-none focus:ring-2 focus:ring-emerald-500
        "
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
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
            absolute z-50 mt-1 w-full
            bg-white border rounded-lg shadow-lg
            max-h-60 overflow-y-auto
          "
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
                w-full text-left px-3 py-2 text-sm
                hover:bg-emerald-50
                ${
                  opt.value === value
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-700"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
