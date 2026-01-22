import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function QuantityStepper({ value, onAdd, onMinus }) {
  // 1. "ADD" BUTTON STATE (When quantity is 0)
  if (!value) {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="
          px-6 py-2 
          bg-emerald-600 
          hover:bg-emerald-700 
          text-white 
          rounded-xl 
          text-[11px] 
          font-black 
          uppercase 
          tracking-widest 
          shadow-lg 
          shadow-emerald-100 
          transition-colors
        "
      >
        Add
      </motion.button>
    );
  }

  // 2. ACTIVE STEPPER STATE
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden"
    >
      <button
        onClick={onMinus}
        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 active:scale-75 transition-all text-emerald-400"
      >
        <Minus size={14} strokeWidth={3} />
      </button>

      <div className="w-8 flex justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-[13px] font-black tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        onClick={onAdd}
        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 active:scale-75 transition-all text-emerald-400"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </motion.div>
  );
}
