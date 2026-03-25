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
          cmr-button
          px-6 py-2.5 
          bg-[#F35C2B] 
          hover:brightness-105 
          text-white 
          rounded-full 
          text-[11px] 
          font-bold 
          uppercase 
          tracking-widest 
          startup-shadow
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
      className="flex items-center bg-[#F35C2B] text-white rounded-full startup-shadow overflow-hidden border border-orange-300/30"
    >
      <button
        onClick={onMinus}
        className="w-9 h-9 flex items-center justify-center hover:bg-white/15 active:scale-95 transition-all text-white"
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
        className="w-9 h-9 flex items-center justify-center hover:bg-white/15 active:scale-95 transition-all text-white"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </motion.div>
  );
}
