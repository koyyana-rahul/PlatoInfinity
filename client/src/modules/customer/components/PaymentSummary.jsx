/**
 * PaymentSummary.jsx
 * Professional payment summary with breakdown and payment options
 */

import { motion } from "framer-motion";
import { DollarSign, Gift, AlertCircle } from "lucide-react";
import clsx from "clsx";

export function PaymentSummary({
  subtotal,
  taxes = 0,
  packaging = 0,
  discount = 0,
  paymentMethod = "CASH",
  showBreakdown = true,
}) {
  const total = subtotal + taxes + packaging - discount;

  const breakdownItems = [
    { label: "Subtotal", amount: subtotal, show: true },
    { label: "Taxes (GST)", amount: taxes, show: taxes > 0 },
    { label: "Packaging", amount: packaging, show: packaging > 0 },
    { label: "Discount", amount: -discount, show: discount > 0 },
  ];

  const paymentMethods = {
    CASH: { icon: "💵", label: "Cash Payment" },
    CARD: { icon: "💳", label: "Card Payment" },
    UPI: { icon: "📱", label: "UPI Payment" },
    WALLET: { icon: "💰", label: "Wallet" },
  };

  const method = paymentMethods[paymentMethod] || paymentMethods.CASH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* ============= PAYMENT SUMMARY ============= */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
        {/* TOTAL */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-4 border-b border-gray-200">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
              Total Amount
            </span>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-black text-gray-900"
            >
              ₹{Math.round(total).toLocaleString()}
            </motion.span>
          </div>
        </div>

        {/* BREAKDOWN */}
        {showBreakdown && (
          <div className="px-4 py-3 space-y-2 text-sm">
            {breakdownItems.map(
              (item, idx) =>
                item.show && (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600">{item.label}</span>
                    <span
                      className={clsx(
                        "font-semibold",
                        item.amount < 0 ? "text-emerald-600" : "text-gray-900",
                      )}
                    >
                      {item.amount < 0 ? "-" : ""}₹
                      {Math.abs(Math.round(item.amount))}
                    </span>
                  </motion.div>
                ),
            )}
          </div>
        )}
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{method.icon}</span>
        <div>
          <p className="text-[10px] font-bold text-blue-600 uppercase">
            Payment Mode
          </p>
          <p className="text-sm font-bold text-blue-900">{method.label}</p>
        </div>
      </div>

      {/* OFFERS */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-start gap-3">
        <Gift size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">
            Great Offer
          </p>
          <p className="text-xs text-emerald-800 font-medium">
            Free packaging included for all orders above ₹500
          </p>
        </div>
      </div>

      {/* INFO */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
        <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-1" />
        <div className="text-xs text-amber-800">
          <p className="font-bold mb-1">Payment Details</p>
          <ul className="space-y-0.5 text-[11px]">
            <li>✓ All prices include applicable taxes</li>
            <li>✓ Secure & encrypted transactions</li>
            <li>✓ Instant confirmation & receipt</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default PaymentSummary;
