/**
 * ProfessionalPinPad.jsx
 * Swiggy/Zomato-style professional PIN entry with haptic feedback
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Lock, CheckCircle } from "lucide-react";

export default function ProfessionalPinPad({
  onComplete,
  onCancel,
  isVerfifying = false,
  error = "",
}) {
  const [pin, setPin] = useState("");
  const [shakeError, setShakeError] = useState(false);
  const audioRef = useRef(null);

  const PIN_LENGTH = 4;
  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  // Play haptic feedback (visual + audio)
  const playHapticFeedback = () => {
    // Visual feedback via shake is handled below
    // For audio: could add a beep sound if device allows
    if (typeof window !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        // Vibration API not supported
      }
    }
  };

  // Handle error shake animation
  useEffect(() => {
    if (error && pin.length === PIN_LENGTH) {
      setShakeError(true);
      const timer = setTimeout(() => setShakeError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error, pin]);

  const handleButtonClick = (num) => {
    if (pin.length < PIN_LENGTH) {
      playHapticFeedback();
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      playHapticFeedback();
      setPin(pin.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (pin.length === PIN_LENGTH && !isVerfifying) {
      playHapticFeedback();
      onComplete(pin);
    }
  };

  useEffect(() => {
    // Auto-submit when PIN is complete
    if (pin.length === PIN_LENGTH && !shakeError && !error) {
      const timer = setTimeout(() => {
        onComplete(pin);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, error, shakeError, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-full max-w-sm mx-auto bg-gradient-to-b from-white to-slate-50 rounded-3xl p-8 space-y-6"
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-2"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-br from-[#F35C2B] to-[#FF7A45] p-4 rounded-full shadow-lg"
          >
            <Lock size={24} className="text-white" />
          </motion.div>
        </div>
        <h3 className="text-xl font-black text-slate-900">Enter 4-Digit PIN</h3>
        <p className="text-sm text-slate-500">
          Secure verification for order confirmation
        </p>
      </motion.div>

      {/* PIN DISPLAY WITH MASKING */}
      <motion.div
        animate={shakeError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`flex justify-center gap-3 mb-2 ${shakeError ? "bg-red-50" : ""} p-6 rounded-2xl transition-colors`}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.08 }}
            className={`
              w-14 h-14 rounded-2xl font-black text-2xl
              flex items-center justify-center
              transition-all duration-200
              ${
                idx < pin.length
                  ? "bg-gradient-to-br from-[#F35C2B] to-[#FF7A45] text-white shadow-md"
                  : "bg-slate-200 text-slate-300 border-2 border-slate-300"
              }
            `}
          >
            {idx < pin.length ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                •
              </motion.div>
            ) : null}
          </motion.div>
        ))}
      </motion.div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg"
          >
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NUMBER PAD */}
      <div className="grid grid-cols-3 gap-3">
        {/* NUMBERS 1-9 */}
        {buttons.slice(0, 9).map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleButtonClick(num)}
            disabled={pin.length >= PIN_LENGTH || isVerfifying}
            className={`
              h-16 rounded-2xl font-bold text-lg
              transition-all duration-200
              ${
                pin.length >= PIN_LENGTH && !isVerfifying
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {num}
          </motion.button>
        ))}

        {/* DELETE BUTTON */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleDelete}
          disabled={pin.length === 0 || isVerfifying}
          className={`
            col-span-1 h-16 rounded-2xl font-bold
            transition-all duration-200 flex items-center justify-center
            ${
              pin.length === 0 || isVerfifying
                ? "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                : "bg-slate-100 text-slate-900 hover:bg-red-100 hover:text-red-600 active:scale-95"
            }
          `}
        >
          <Delete size={20} />
        </motion.button>

        {/* ZERO BUTTON */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => handleButtonClick(0)}
          disabled={pin.length >= PIN_LENGTH || isVerfifying}
          className={`
            col-span-1 h-16 rounded-2xl font-bold text-lg
            transition-all duration-200
            ${
              pin.length >= PIN_LENGTH && !isVerfifying
                ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                : "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          0
        </motion.button>

        {/* SUBMIT/CONFIRM BUTTON */}
        <motion.button
          whileTap={pin.length === PIN_LENGTH ? { scale: 0.92 } : {}}
          onClick={handleSubmit}
          disabled={pin.length !== PIN_LENGTH || isVerfifying}
          className={`
            col-span-1 h-16 rounded-2xl font-bold text-lg
            transition-all duration-200 flex items-center justify-center
            ${
              pin.length === PIN_LENGTH && !isVerfifying
                ? "bg-gradient-to-br from-[#F35C2B] to-[#FF7A45] text-white hover:brightness-105 active:scale-95 shadow-md"
                : "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50"
            }
          `}
        >
          {isVerfifying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            <CheckCircle size={20} />
          )}
        </motion.button>
      </div>

      {/* CANCEL BUTTON */}
      {onCancel && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="w-full py-3 text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
        >
          Cancel
        </motion.button>
      )}

      {/* SECURITY BADGE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4"
      >
        <Lock size={14} />
        <span>256-bit encryption • Secure verification</span>
      </motion.div>
    </motion.div>
  );
}
