import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiRefreshCcw } from "react-icons/fi";
import Axios from "../../../api/axios";
import billApi from "../../../api/bill.api";
import { useSocket } from "../../../socket/SocketProvider";

export default function CashierSummary() {
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const socket = useSocket();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = async (silent = false) => {
    if (!restaurantId) return;
    try {
      if (!silent) setLoading(true);
      const res = await Axios(billApi.list(restaurantId));
      setBills(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const handleRealtimeSync = () => {
      loadBills(true);
    };

    const events = [
      "order:placed",
      "order:item-status-updated",
      "order:status-changed",
      "order:served",
      "order:cancelled",
      "session:opened",
      "session:closed",
      "bill:generated",
      "bill:paid",
      "cashier:payment-processed",
      "cashier:bill-settled",
    ];

    events.forEach((eventName) => socket.on(eventName, handleRealtimeSync));
    socket.on("connect", handleRealtimeSync);

    return () => {
      events.forEach((eventName) => socket.off(eventName, handleRealtimeSync));
      socket.off("connect", handleRealtimeSync);
    };
  }, [socket, restaurantId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBills(true);
    setRefreshing(false);
  };

  const summary = useMemo(() => {
    return {
      total: bills.reduce((sum, b) => sum + (b.total || 0), 0),
      paid: bills.filter((b) => b.status === "PAID").length,
      open: bills.filter((b) => b.status === "OPEN").length,
      count: bills.length,
    };
  }, [bills]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading summary...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Summary</h1>
            <p className="text-sm text-gray-600 mt-1">
              Shift totals and payment status
            </p>
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            📊 Overview
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Kpi label="Total Bills" value={summary.count} />
        <Kpi
          label="Collection"
          value={`₹${Math.round(summary.total)}`}
          tone="green"
        />
        <Kpi label="Paid" value={summary.paid} tone="blue" />
        <Kpi label="Pending" value={summary.open} tone="orange" />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-10 px-4 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-semibold text-sm hover:shadow-sm disabled:opacity-60 inline-flex items-center gap-2"
        >
          <FiRefreshCcw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bills</h2>
        {bills.length === 0 ? (
          <p className="text-gray-500">No bills yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bills
              .slice(-10)
              .reverse()
              .map((bill) => (
                <div
                  key={bill._id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      Bill #{String(bill._id).slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(bill.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{Math.round(bill.total || 0)}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded border ${
                        bill.status === "PAID"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : tone === "green"
        ? "bg-green-50 border-green-200 text-green-700"
        : tone === "blue"
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
