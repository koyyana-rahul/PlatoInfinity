/**
 * OrderTracker.jsx
 * Real-time order tracking with progress, estimated time, and item status
 */

import { motion } from "framer-motion";
import { Clock, Check, ChefHat, AlertCircle } from "lucide-react";
import clsx from "clsx";

export function OrderTracker({ order, estimatedTime }) {
  if (!order) return null;

  const stages = [
    { id: "NEW", label: "Order Placed", icon: "📋" },
    { id: "IN_PROGRESS", label: "Cooking", icon: "👨‍🍳" },
    { id: "READY", label: "Ready", icon: "✅" },
    { id: "SERVED", label: "Served", icon: "🛎️" },
  ];

  const statusOrder = ["NEW", "IN_PROGRESS", "READY", "SERVED"];
  const currentStageIndex = statusOrder.indexOf(order.orderStatus || "NEW");

  // Calculate progress percentage
  const progress = ((currentStageIndex + 1) / stages.length) * 100;

  // Get items by status
  const itemsByStatus = {
    NEW: order.items?.filter((i) => i.itemStatus === "NEW") || [],
    IN_PROGRESS:
      order.items?.filter((i) => i.itemStatus === "IN_PROGRESS") || [],
    READY: order.items?.filter((i) => i.itemStatus === "READY") || [],
    SERVED: order.items?.filter((i) => i.itemStatus === "SERVED") || [],
  };

  const totalItems = order.items?.length || 0;
  const readyItems =
    (itemsByStatus.READY?.length || 0) + (itemsByStatus.SERVED?.length || 0);
  const progressPercent = totalItems > 0 ? (readyItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* ============= PROGRESS BAR ============= */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-6 space-y-4">
        {/* STAGE PROGRESS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Order Status
            </p>
            <span className="text-xs font-black text-[#F35C2B]">
              {progress.toFixed(0)}%
            </span>
          </div>

          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] rounded-full shadow-lg"
            />
          </div>
        </div>

        {/* STAGE INDICATORS */}
        <div className="grid grid-cols-4 gap-2">
          {stages.map((stage, idx) => {
            const isActive = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={clsx(
                  "text-center py-2 px-2 rounded-xl transition-all",
                  isActive
                    ? isCurrent
                      ? "bg-[#F35C2B] ring-2 ring-[#F35C2B] ring-offset-2 shadow-lg"
                      : "bg-emerald-50"
                    : "bg-gray-50",
                )}
              >
                <p className="text-lg mb-1">{stage.icon}</p>
                <p
                  className={clsx(
                    "text-[9px] font-bold uppercase tracking-wider leading-none",
                    isActive
                      ? isCurrent
                        ? "text-white"
                        : "text-emerald-700"
                      : "text-gray-500",
                  )}
                >
                  {stage.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ============= ESTIMATED TIME ============= */}
      {estimatedTime && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl ring-1 ring-blue-200 p-4 flex items-center gap-3">
          <Clock size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase">
              Estimated Time
            </p>
            <p className="text-sm font-bold text-blue-900">
              ~{estimatedTime} min{estimatedTime > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ============= ITEMS BY STATUS ============= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden"
      >
        {/* OVERALL PROGRESS */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Item Progress
            </p>
            <span className="text-xs font-black text-[#F35C2B]">
              {readyItems}/{totalItems}
            </span>
          </div>
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* STATUS GROUPS */}
        {["NEW", "IN_PROGRESS", "READY", "SERVED"].map((status) => {
          const items = itemsByStatus[status] || [];
          if (items.length === 0) return null;

          const statusConfig = {
            NEW: { icon: "📋", label: "Pending", color: "bg-yellow-50" },
            IN_PROGRESS: {
              icon: "👨‍🍳",
              label: "Cooking",
              color: "bg-blue-50",
            },
            READY: { icon: "✅", label: "Ready", color: "bg-emerald-50" },
            SERVED: { icon: "🎉", label: "Served", color: "bg-green-50" },
          };

          const config = statusConfig[status];

          return (
            <div key={status} className={`${config.color} px-4 py-3`}>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-2 flex items-center gap-2">
                <span>{config.icon}</span>
                {config.label}
              </p>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-lg">{config.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">
                        {item.itemName}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ============= ORDER DETAILS ============= */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Order #</span>
          <span className="font-bold text-gray-900">
            {String(order._id || "")
              .slice(-6)
              .toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Amount</span>
          <span className="font-bold text-gray-900">
            ₹{Math.round(order.totalAmount || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Order Time</span>
          <span className="font-bold text-gray-900">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderTracker;
