/**
 * OrderTracker.jsx
 * Production-ready order tracking component
 * Shows order status with timeline
 * Fully responsive
 */

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Loader,
  AlertCircle,
  ChefHat,
  Truck,
  Package,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import Axios from "../api/axios";
import orderApi from "../api/order.api";

export default function OrderTracker({ orderId, restaurantId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await Axios(orderApi.getOrderDetail(restaurantId, orderId));
      setOrder(res.data?.data);
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8 text-gray-500">Order not found</div>
    );
  }

  const statuses = [
    {
      key: "PLACED",
      label: "Placed",
      icon: Package,
      color: "bg-blue-100 text-blue-700",
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
      icon: CheckCircle2,
      color: "bg-cyan-100 text-cyan-700",
    },
    {
      key: "PREPARING",
      label: "Preparing",
      icon: ChefHat,
      color: "bg-orange-100 text-orange-700",
    },
    {
      key: "READY",
      label: "Ready",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
    },
    {
      key: "SERVED",
      label: "Served",
      icon: Truck,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === order.status);

  return (
    <div className="w-full">
      {/* Order Header */}
      <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Order #{order.orderNumber}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
          <span>
            Placed at{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Table {order.tableName || order.tableId}</span>
        </div>
      </div>

      {/* Status Timeline - Horizontal Scroll on Mobile */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-4">
          Order Status
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-2 sm:gap-4 min-w-min sm:min-w-0">
            {statuses.map((status, idx) => {
              const isCompleted = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              const Icon = status.icon;

              return (
                <div key={status.key} className="flex flex-col items-center">
                  {/* Status Circle */}
                  <div
                    className={clsx(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-all",
                      isCompleted ? status.color : "bg-gray-100 text-gray-400",
                      isCurrent && "ring-2 ring-offset-2 ring-blue-600",
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Label */}
                  <p
                    className={clsx(
                      "text-xs font-medium whitespace-nowrap",
                      isCompleted ? "text-gray-900" : "text-gray-500",
                    )}
                  >
                    {status.label}
                  </p>

                  {/* Divider Line (hidden on last item) */}
                  {idx < statuses.length - 1 && (
                    <div
                      className={clsx(
                        "hidden sm:block absolute left-0 top-5 sm:top-6 w-12 sm:w-16 h-0.5 transform translate-x-full sm:translate-x-16",
                        isCompleted ? "bg-blue-600" : "bg-gray-300",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Order Items
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {(order.items || []).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base text-gray-900">
                  {item.name}
                </p>
                {item.notes && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {item.notes}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-sm sm:text-base text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-600">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <div className="space-y-2 sm:space-y-3 mb-4">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">
              ₹{(order.subtotal || 0).toLocaleString("en-IN")}
            </span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-700">Tax (SGST/CGST)</span>
              <span className="font-medium text-gray-900">
                ₹{(order.tax || 0).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-green-700">Discount</span>
              <span className="font-medium text-green-700">
                -₹{(order.discount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-lg sm:text-xl font-bold text-blue-600">
            ₹{(order.total || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Expected Preparation Time */}
      {order.expectedTime && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm sm:text-base text-blue-900">
              Expected in {order.expectedTime} minutes
            </p>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">
              Your order will be ready soon. Thank you for your patience!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
