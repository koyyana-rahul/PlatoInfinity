import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Loader2,
  DollarSign,
  UpiIcon,
  CreditCard,
  Lock,
  X,
} from "lucide-react";
import Axios from "../../../api/axios";
import CashierPinModal from "../components/CashierPinModal";

/**
 * CashierBillDashboard.jsx
 *
 * Cashier sees all open bills for restaurant
 * Click to view itemized breakdown
 * Close bill with:
 * - Cash
 * - UPI (in-app)
 * - Card (future)
 *
 * Requires Staff PIN to pay
 */
export default function CashierBillDashboard() {
  const { restaurantId } = useParams();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // PIN MODAL
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const fetchOpenBills = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        url: `/api/cashier/bills`,
        method: "GET",
      });

      setBills(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenBills();
    const interval = setInterval(fetchOpenBills, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePayBill = (bill, method) => {
    setSelectedBill(bill);
    setPaymentMethod(method);
    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin) => {
    if (!selectedBill) return;

    try {
      setPinLoading(true);

      const res = await Axios({
        url: `/api/cashier/bill/${selectedBill._id}/close`,
        method: "POST",
        data: {
          paymentMethod: paymentMethod,
          staffPin: pin,
        },
      });

      if (res.data?.success) {
        toast.success(`✅ Bill paid via ${paymentMethod}!`);
        setShowPinModal(false);
        setSelectedBill(null);
        setPaymentMethod(null);
        fetchOpenBills();
      } else {
        toast.error(res.data?.message || "Failed to close bill");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error processing payment");
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="text-orange-500 animate-spin mx-auto mb-4"
          />
          <p className="text-slate-300">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HEADER */}
      <div className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">💳 Billing</h1>
            <p className="text-sm text-slate-400 mt-2">
              {bills.length} open bill{bills.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={fetchOpenBills}
            className="p-3 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
          >
            🔄
          </button>
        </div>
      </div>

      {/* BILLS GRID */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">☀️</span>
            </div>
            <p className="text-slate-400 text-lg font-medium">No open bills</p>
            <p className="text-slate-500 text-sm mt-2">
              All tables have settled payments
            </p>
          </div>
        ) : (
          bills.map((bill) => (
            <div
              key={bill._id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* BILL HEADER */}
              <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/20 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Table</p>
                  <p className="text-3xl font-black text-white">
                    {bill.session?.tableId?.toString().slice(-2) || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-white text-white">
                    ₹{bill.grandTotal || bill.total || 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Total Amount</p>
                </div>
              </div>

              {/* ITEMS SUMMARY */}
              <div className="px-6 py-4 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {bill.items?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-slate-400">₹{item.lineTotal}</span>
                    </div>
                  ))}
                  {bill.items?.length > 5 && (
                    <p className="text-xs text-slate-500 italic mt-2">
                      +{bill.items.length - 5} more items
                    </p>
                  )}
                </div>
              </div>

              {/* BILL DETAILS */}
              <div className="bg-slate-700/50 px-6 py-3 border-b border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">₹{bill.subtotal || 0}</span>
                </div>
                {bill.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax</span>
                    <span className="text-white">₹{bill.tax || 0}</span>
                  </div>
                )}
                {bill.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹{bill.discount}</span>
                  </div>
                )}
              </div>

              {/* PAYMENT METHODS */}
              <div className="px-6 py-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePayBill(bill, "CASH")}
                  className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors active:scale-95 text-sm"
                >
                  <DollarSign size={18} /> Cash
                </button>
                <button
                  onClick={() => handlePayBill(bill, "UPI")}
                  className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors active:scale-95 text-sm"
                >
                  <span>📲</span> UPI
                </button>
                <button
                  onClick={() => handlePayBill(bill, "CARD")}
                  className="flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors active:scale-95 text-sm"
                >
                  <CreditCard size={18} /> Card
                </button>
              </div>

              {/* BILL STATUS */}
              <div className="px-6 py-2 bg-slate-700/30 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Bill #{bill._id?.toString().slice(-6).toUpperCase()}
                </span>
                <span>{bill.items?.length || 0} items</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PIN MODAL */}
      {selectedBill && (
        <CashierPinModal
          isOpen={showPinModal}
          amount={selectedBill.grandTotal || selectedBill.total}
          paymentMethod={paymentMethod}
          onClose={() => {
            setShowPinModal(false);
            setSelectedBill(null);
            setPaymentMethod(null);
          }}
          onConfirm={handlePinConfirm}
          isLoading={pinLoading}
        />
      )}
    </div>
  );
}
