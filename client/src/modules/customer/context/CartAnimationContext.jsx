/**
 * CartAnimationContext.jsx
 * Coordinates flying animations from ItemCard to CartBadge
 * Swiggy/Zomato-style professional UX
 */

import { createContext, useContext, useState, useCallback } from "react";
import { motion } from "framer-motion";

const CartAnimationContext = createContext();

export function CartAnimationProvider({ children }) {
  const [flyingItems, setFlyingItems] = useState([]);

  const triggerFlyingAnimation = useCallback((sourceElement, itemData) => {
    if (!sourceElement) return;

    const id = `fly-${Date.now()}-${Math.random()}`;
    const rect = sourceElement.getBoundingClientRect();

    // Add flying item to state
    setFlyingItems((prev) => [
      ...prev,
      {
        id,
        sourceRect: rect,
        itemData,
      },
    ]);

    // Remove after animation completes
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ triggerFlyingAnimation }}>
      {children}

      {/* Flying Items Container */}
      <div className="fixed inset-0 pointer-events-none z-[999]">
        {flyingItems.map((flying) => (
          <FlyingItem key={flying.id} flying={flying} />
        ))}
      </div>
    </CartAnimationContext.Provider>
  );
}

// Hook to use cart animation
export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error(
      "useCartAnimation must be used within CartAnimationProvider",
    );
  }
  return context;
}

/**
 * Individual Flying Item Component
 * Animates from source position to cart badge (bottom-right area)
 */
function FlyingItem({ flying }) {
  const { sourceRect, itemData } = flying;

  // Calculate target position (approximate cart badge position)
  // For bottom-sticky cart bar: bottom ~6rem (md) / 24 (mobile), right ~2rem
  const targetX = window.innerWidth - 80; // Right side
  const targetY = window.innerHeight - 120; // Bottom area (above sticky bar)

  return (
    <motion.div
      initial={{
        x: sourceRect.left,
        y: sourceRect.top,
        opacity: 1,
        scale: 1,
      }}
      animate={{
        x: targetX,
        y: targetY,
        opacity: 0,
        scale: 0.2,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth flight
        type: "tween",
      }}
      className="fixed w-32 h-32 pointer-events-none"
    >
      {/* Floating Item Container */}
      <div className="relative w-full h-full">
        {/* Item Image - flies from card to cart */}
        <motion.div
          initial={{ scale: 1, rotate: 0 }}
          animate={{ scale: 0.3, rotate: 20 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-2xl overflow-hidden"
        >
          {itemData?.image ? (
            <img
              src={itemData.image}
              alt="Flying item"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
              +1
            </div>
          )}
        </motion.div>

        {/* Checkmark that appears at end */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
        >
          ✓
        </motion.div>
      </div>
    </motion.div>
  );
}
