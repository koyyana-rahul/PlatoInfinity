import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "./ItemCard";
import { Utensils } from "lucide-react";

export default function ItemGrid({
  items = [],
  quantities = {},
  onAdd,
  onMinus,
}) {
  /* ================= EMPTY STATE ================= */
  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 px-10 text-center"
      >
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <Utensils className="text-slate-200" size={24} strokeWidth={1.5} />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          No items found in this section
        </p>
      </motion.div>
    );
  }

  /* ================= GRID RENDER ================= */
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 px-1 pb-10">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05, // Staggered entry effect
              ease: [0.215, 0.61, 0.355, 1], // Custom cubic-bezier for smooth motion
            }}
          >
            <ItemCard
              item={item}
              qty={quantities[item.id] ?? 0}
              onAdd={onAdd}
              onMinus={onMinus}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
