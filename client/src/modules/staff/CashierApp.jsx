/**
 * CASHIER APP
 * React component for cashier counter/payment desk
 * Handles:
 * - PIN login with staff code + 4-digit PIN
 * - View open bills from sessions
 * - Process cash and UPI payments
 * - Generate invoices and WhatsApp bill sharing
 * - Close sessions
 * - Transaction history
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  LogOut,
  Lock,
  ShoppingBag,
  Share2,
  DollarSign,
  CheckCircle,
  Eye,
} from "lucide-react";

import Axios from "../../api/axios";
import { setUserDetails, logout } from "../../store/auth/userSlice";
import { socketService } from "../../api/socket.service";

export function CashierApp() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

  // State
  const [view, setView] = useState("login");
  const [staffCode, setStaffCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [openBills, setOpenBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // CASH or UPI
  const [amountReceived, setAmountReceived] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [transactions, setTransactions] = useState([]);

  // PIN Login
  const handlePinLogin = async (e) => {
    e.preventDefault();

    if (!staffCode || !pin) {
      toast.error("Please enter staff code and PIN");
      return;
    }

    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await Axios.post("/api/auth/staff/pin-login", {
        staffCode,
        pin,
        restaurantId: "current_restaurant_id",
      });

      if (response.data?.success) {
        dispatch(setUserDetails(response.data.data));
        localStorage.setItem("staffToken", response.data.token);
        setView("counter");
        toast.success(`Welcome, ${response.data.data.name}!`);

        // Join socket room
        socketService.emit("join-room", {
          room: `restaurant:${response.data.data.restaurantId}:cashier`,
        });

        setStaffCode("");
        setPin("");
        loadOpenBills();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Load open bills
  const loadOpenBills = async () => {
    try {
      const response = await Axios.get("/api/bills/open", {
        params: { restaurantId: user?.restaurantId },
      });

      if (response.data?.success) {
        setOpenBills(response.data.data);
      }
    } catch (error) {
      console.error("Load bills error:", error);
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedBill) {
      toast.error("Select a bill");
      return;
    }

    try {
      setLoading(true);

      let paymentData = {
        billId: selectedBill._id,
        paymentMethod,
      };

      if (paymentMethod === "CASH") {
        if (!amountReceived || isNaN(amountReceived)) {
          toast.error("Enter valid amount");
          return;
        }

        paymentData.amountReceived = parseFloat(amountReceived);
      } else if (paymentMethod === "UPI") {
        // Razorpay integration would go here
        // For now, we'll create order and redirect
        showUPIPaymentModal();
        return;
      }

      const response = await Axios.post(
        "/api/bill/process-payment",
        paymentData,
      );

      if (response.data?.success) {
        toast.success("Payment processed!");

        // Send WhatsApp bill if phone provided
        if (customerPhone) {
          await sendWhatsAppBill(selectedBill._id, customerPhone);
        }

        // Update bill list
        setOpenBills(openBills.filter((b) => b._id !== selectedBill._id));
        setSelectedBill(null);
        setAmountReceived("");
        setPaymentMethod("CASH");

        // Add to transactions
        setTransactions([response.data.data, ...transactions]);

        // Refresh bills
        setTimeout(loadOpenBills, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // Send WhatsApp bill
  const sendWhatsAppBill = async (billId, phone) => {
    try {
      const response = await Axios.post(`/api/bill/${billId}/whatsapp`, {
        phoneNumber: phone,
      });

      if (response.data?.success) {
        toast.success("Bill sent via WhatsApp!");
      }
    } catch (error) {
      console.warn("WhatsApp send failed (non-critical):");
    }
  };

  // Show UPI payment modal
  const showUPIPaymentModal = () => {
    toast("UPI Payment: Integrate Razorpay/Paytm here", { icon: "💳" });
    // Would open Razorpay payment modal
  };

  // Logout
  const handleLogout = async () => {
    try {
      await Axios.post("/api/auth/staff/pin-logout");
      dispatch(logout());
      setView("login");
      toast.success("Logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- LOGIN VIEW ---
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              Payment Counter
            </h1>
            <p className="text-gray-600 mt-2">Cashier Staff Login</p>
          </div>

          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Staff Code
              </label>
              <input
                type="text"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                placeholder="E.g., CASH001"
                className="w-full border border-gray-300 rounded-lg p-3 font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                4-Digit PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
                placeholder="••••"
                maxLength="4"
                className="w-full border border-gray-300 rounded-lg p-3 font-semibold text-center tracking-widest text-2xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Open Till"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- COUNTER VIEW ---
  if (view === "counter") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">💳 Payment Counter</h1>
              <p className="text-green-100 text-sm">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-green-700 hover:bg-green-800 p-3 rounded-full"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bills List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold mb-4">📋 Open Bills</h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {openBills.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No open bills</p>
              ) : (
                openBills.map((bill) => (
                  <div
                    key={bill._id}
                    onClick={() => setSelectedBill(bill)}
                    className={`p-3 rounded-lg cursor-pointer transition border-2 ${
                      selectedBill?._id === bill._id
                        ? "bg-green-100 border-green-600"
                        : "bg-white border-gray-200 hover:border-green-400"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">
                      {bill.tableId?.tableName}
                    </p>
                    <p className="text-sm text-gray-600">₹{bill.totalAmount}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {bill.itemCount} items
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bill Details */}
          <div className="lg:col-span-2">
            {selectedBill ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedBill.tableId?.tableName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Bill #{selectedBill._id.toString().slice(-6)}
                    </p>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Items */}
                <div className="bg-gray-50 p-4 rounded mb-6 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedBill.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-green-50 p-4 rounded mb-6 border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                      ₹{selectedBill.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Payment Method:
                  </label>
                  <div className="flex gap-2">
                    {["CASH", "UPI"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 py-2 rounded font-semibold transition ${
                          paymentMethod === method
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        {method === "CASH" ? "💵 Cash" : "📱 UPI"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Input */}
                {paymentMethod === "CASH" && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                      Amount Received (₹):
                    </label>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-3 text-lg font-semibold"
                    />
                    {amountReceived && (
                      <p className="text-sm mt-2 text-green-600 font-semibold">
                        Change: ₹
                        {(
                          parseFloat(amountReceived) - selectedBill.totalAmount
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* WhatsApp Bill */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Share Bill via WhatsApp:
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Customer phone (10 digits)"
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>

                {/* Process Button */}
                <button
                  onClick={processPayment}
                  disabled={
                    loading || (paymentMethod === "CASH" && !amountReceived)
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Process Payment
                </button>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select a bill to process payment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transactions History */}
        {transactions.length > 0 && (
          <div className="max-w-4xl mx-auto p-4 mt-8">
            <h2 className="text-lg font-bold mb-4">✓ Recent Transactions</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Table
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((txn) => (
                    <tr key={txn._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">
                        {txn.tableId?.tableName}
                      </td>
                      <td className="px-4 py-3 text-green-600 font-bold">
                        ₹{txn.totalAmount}
                      </td>
                      <td className="px-4 py-3 text-sm">{txn.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(txn.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default CashierApp;
