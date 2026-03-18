import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiDownload, FiRefreshCcw } from "react-icons/fi";
import Axios from "../../../api/axios";
import billApi from "../../../api/bill.api";
import { useSocket } from "../../../socket/SocketProvider";

export default function CashierInvoices() {
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const socket = useSocket();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = async (silent = false) => {
    if (!restaurantId) return;
    try {
      if (!silent) setLoading(true);
      const res = await Axios(billApi.list(restaurantId, { status: "PAID" }));
      setInvoices(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const handleRealtimeSync = () => {
      loadInvoices(true);
    };

    const events = [
      "order:status-changed",
      "order:served",
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
    await loadInvoices(true);
    setRefreshing(false);
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading invoices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paid Invoices</h1>
            <p className="text-sm text-gray-600 mt-1">
              {invoices.length} completed transactions
            </p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            ✓ {invoices.length}
          </div>
        </div>
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
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No invoices yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Paid bills will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:shadow-md transition"
              >
                <div>
                  <p className="font-bold text-gray-900">
                    Invoice #{String(invoice._id).slice(-6)}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>₹{Math.round(invoice.total || 0)}</span>
                    <span>•</span>
                    <span>{invoice.paymentMethod || "CASH"}</span>
                    <span>•</span>
                    <span>
                      {new Date(
                        invoice.paidAt || invoice.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  className="h-9 w-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                  title="Download invoice"
                >
                  <FiDownload size={16} className="text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
