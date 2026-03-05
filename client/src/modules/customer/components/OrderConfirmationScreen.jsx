/**
 * OrderConfirmationScreen.jsx
 * Swiggy/Zomato-style order confirmation with celebration animation
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat, MapPin, Phone } from "lucide-react";

export default function OrderConfirmationScreen({
  order,
  onNavigateToOrders,
  restaurantInfo,
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  // Auto-navigate after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigateToOrders();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onNavigateToOrders]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-[999] flex items-center justify-center p-4"
    >
      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}

      {/* Content Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 100,
          delay: 0.2,
        }}
        className="w-full max-w-md"
      >
        {/* SUCCESS CHECKMARK */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 200,
            delay: 0.3,
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <CheckCircle size={56} className="text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* SUCCESS MESSAGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-black text-white mb-2">
            Order Confirmed! 🎉
          </h2>
          <p className="text-slate-300 text-sm">
            Your delicious food is on its way to you
          </p>
        </motion.div>

        {/* ORDER DETAILS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20 space-y-4"
        >
          {/* ORDER ID */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between"
          >
            <span className="text-slate-300 text-sm">Order ID</span>
            <span className="text-white font-bold text-lg">
              #{order?._id?.slice(-6) || "---"}
            </span>
          </motion.div>

          {/* AMOUNT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 }}
            className="flex items-center justify-between pt-4 border-t border-white/10"
          >
            <span className="text-slate-300 text-sm">Total Amount</span>
            <span className="text-white font-black text-2xl">
              ₹{order?.totalAmount || 0}
            </span>
          </motion.div>

          {/* ITEMS COUNT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between pt-2"
          >
            <span className="text-slate-300 text-sm">Items</span>
            <span className="text-white font-semibold">
              {order?.items?.length || 0} item
              {order?.items?.length !== 1 ? "s" : ""}
            </span>
          </motion.div>
        </motion.div>

        {/* STATUS INDICATOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-blue-300"
            >
              <ChefHat size={20} />
            </motion.div>
            <div>
              <p className="text-blue-200 font-semibold text-sm">
                Kitchen is preparing your order
              </p>
              <p className="text-blue-300/70 text-xs">
                Est. time: 20-30 minutes
              </p>
            </div>
          </div>
        </motion.div>

        {/* RESTAURANT INFO (if available) */}
        {restaurantInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-white/5 rounded-xl p-4 mb-6 space-y-2 border border-white/10"
          >
            <p className="text-white font-semibold text-sm">
              {restaurantInfo.name}
            </p>
            {restaurantInfo.location && (
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <MapPin size={14} />
                <span>{restaurantInfo.location}</span>
              </div>
            )}
            {restaurantInfo.phone && (
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <Phone size={14} />
                <span>{restaurantInfo.phone}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* NEXT STEP BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNavigateToOrders}
          className="w-full bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all shadow-lg"
        >
          Track Your Order
        </motion.button>

        {/* AUTO-REDIRECT INDICATOR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-slate-400 text-xs mt-4"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Redirecting automatically...
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Confetti Animation Component
 * Creates falling confetti pieces for celebration
 */
function ConfettiAnimation() {
  const confettiPieces = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1,
    angle: Math.random() * 360,
    color: [
      "bg-orange-400",
      "bg-blue-400",
      "bg-green-400",
      "bg-yellow-400",
      "bg-pink-400",
    ][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.left}vw`,
            y: "-20px",
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: `calc(${piece.left}vw + ${Math.random() * 100 - 50}px)`,
            y: "100vh",
            opacity: 0,
            rotate: piece.angle,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn",
          }}
          className={`absolute w-3 h-3 rounded-full ${piece.color}`}
        />
      ))}
    </div>
  );
}
