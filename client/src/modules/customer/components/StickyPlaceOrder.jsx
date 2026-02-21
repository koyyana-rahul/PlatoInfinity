import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const StickyPlaceOrder = ({
  totalAmount,
  totalQty,
  onClick,
  isPlacing,
  buttonText,
}) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-cream/80 dark:bg-dark-bg/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-md mx-auto">
        <button
          onClick={onClick}
          disabled={isPlacing}
          className="w-full h-16 bg-saffron text-white rounded-2xl flex items-center justify-between px-6 tap-scaling shadow-lg hover:shadow-xl transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPlacing ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : (
            <>
              <div className="text-left">
                <span className="text-sm font-semibold">
                  {totalQty} {totalQty > 1 ? "Items" : "Item"}
                </span>
                <p className="text-xl font-extrabold">₹{Math.round(totalAmount)}</p>
              </div>
              <div className="flex items-center gap-2 text-lg font-bold">
                <span>{buttonText}</span>
                <ArrowRight size={20} strokeWidth={3} />
              </div>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default StickyPlaceOrder;
