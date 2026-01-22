import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ReceiptText,
  Clock,
  Loader2,
  UtensilsCrossed,
  ChevronRight,
  CheckCircle2,
  Timer,
  ChevronDown,
} from "lucide-react";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";

export default function CustomerOrders() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();

  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const basePath = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({}); // Track multiple open states

  useEffect(() => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(basePath, { replace: true });
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await Axios(customerApi.order.listBySession(sessionId));
        const orderData = res.data?.data || res.data || [];
        const finalOrders = Array.isArray(orderData) ? orderData : [];
        setOrders(finalOrders);

        // Auto-expand the most recent order if it exists
        if (finalOrders.length > 0) {
          setExpandedOrders({ [finalOrders[0]._id]: true });
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [sessionId, navigate, basePath]);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const grandTotal = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );
  const totalItemsCount = orders.reduce(
    (sum, order) => sum + (order.items?.length || 0),
    0,
  );

  const getStatusStyles = (status) => {
    const base =
      "text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border";
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "PAID":
        return `${base} bg-emerald-50 text-emerald-600 border-emerald-100`;
      case "CANCELLED":
        return `${base} bg-red-50 text-red-600 border-red-100`;
      default:
        return `${base} bg-slate-900 text-white border-slate-900`;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Loader2
          className="w-6 h-6 text-slate-900 animate-spin mb-4"
          strokeWidth={1.5}
        />
        <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
          Syncing Orders
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center font-sans">
        <UtensilsCrossed
          size={48}
          className="text-slate-100 mb-6"
          strokeWidth={1}
        />
        <h1 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          No history
        </h1>
        <p className="text-sm text-slate-400 mb-8 font-medium">
          Your order list is currently empty.
        </p>
        <button
          onClick={() => navigate(basePath + "/menu")}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          View Menu <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans max-w-2xl mx-auto pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 active:scale-90 transition-transform"
          >
            <ChevronLeft
              size={18}
              className="text-slate-900"
              strokeWidth={2.5}
            />
          </button>
          <div>
            <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
              Orders
            </h1>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
              Table Session
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Total Bill
          </p>
          <p className="text-sm font-black text-slate-900">
            ₹{Math.round(grandTotal)}
          </p>
        </div>
      </header>

      <main className="px-5 pt-8">
        {/* SUMMARY CARD */}
        <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-6 text-white flex items-center justify-between shadow-2xl shadow-slate-200">
          <div>
            <h2 className="text-lg font-black">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </h2>
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest mt-1">
              {totalItemsCount} Items Total
            </p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-400" />
          </div>
        </div>

        {/* ORDER ACCORDION LIST */}
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders[order._id];
            return (
              <div key={order._id} className="overflow-hidden">
                {/* ACCORDION TRIGGER */}
                <button
                  onClick={() => toggleOrder(order._id)}
                  className={`w-full text-left flex items-center justify-between p-5 bg-white border border-slate-100 transition-all ${isExpanded ? "rounded-t-[2rem] border-b-0" : "rounded-[2rem] shadow-sm"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                      <ReceiptText size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        {order.orderNumber ||
                          `ID: ${(order._id || "").slice(-5).toUpperCase()}`}
                      </p>
                      <p className="text-[14px] font-black text-slate-900">
                        ₹{Math.round(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isExpanded && (
                      <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 uppercase">
                        {order.items?.length} Items
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "circOut" }}
                    >
                      <ChevronDown size={18} className="text-slate-400" />
                    </motion.div>
                  </div>
                </button>

                {/* ACCORDION CONTENT */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "circOut" }}
                      className="bg-white border-x border-b border-slate-100 rounded-b-[2rem] overflow-hidden"
                    >
                      <div className="p-5 pt-0 space-y-4">
                        <div className="h-px bg-slate-50 w-full mb-4" />

                        {order.items?.map((it, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-start group"
                          >
                            <div className="flex-1">
                              <h4 className="font-bold text-[13px] text-slate-800 uppercase leading-none mb-2">
                                {it.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                  x{it.quantity}
                                </span>
                                {it.itemStatus && (
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                    <Timer size={10} /> {it.itemStatus}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="font-bold text-[13px] text-slate-900">
                              ₹{Math.round(it.price * it.quantity)}
                            </p>
                          </div>
                        ))}

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "--:--"}
                            </span>
                          </div>
                          <span className={getStatusStyles(order.orderStatus)}>
                            {order.orderStatus || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>

      {/* FLOATING ACTION */}
      <div className="fixed bottom-8 left-0 right-0 z-40 px-6">
        <button
          onClick={() => navigate(basePath + "/menu")}
          className="max-w-md mx-auto w-full h-15 bg-slate-900 text-white rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-slate-400 active:scale-95 transition-transform py-4"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            Add Items
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
