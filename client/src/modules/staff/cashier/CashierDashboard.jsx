import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useSocket } from "../../../socket/SocketProvider";

import Axios from "../../../api/axios";
import sessionApi from "../../../api/session.api";
import billApi from "../../../api/bill.api";

export default function CashierDashboard() {
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const socket = useSocket();

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSessions = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await Axios(
        sessionApi.list(restaurantId, { status: "OPEN" }),
      );
      const data = res.data?.data || [];
      setSessions(data);
      if (!selectedSessionId && data.length) {
        setSelectedSessionId(String(data[0]._id));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadBill = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await Axios(billApi.getBySession(sessionId));
      setBill(res.data?.data || null);
    } catch {
      setBill(null);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [restaurantId]);

  useEffect(() => {
    loadBill(selectedSessionId);
  }, [selectedSessionId]);

  useEffect(() => {
    if (!socket) return;

    const handleRealtimeSync = () => {
      loadSessions();
      if (selectedSessionId) {
        loadBill(selectedSessionId);
      }
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
      "bill:ready-for-payment",
      "cashier:bill-settled",
    ];

    events.forEach((eventName) => socket.on(eventName, handleRealtimeSync));
    socket.on("connect", handleRealtimeSync);

    return () => {
      events.forEach((eventName) => socket.off(eventName, handleRealtimeSync));
      socket.off("connect", handleRealtimeSync);
    };
  }, [socket, selectedSessionId]);

  const selectedSession = useMemo(
    () =>
      sessions.find((s) => String(s._id) === String(selectedSessionId)) || null,
    [sessions, selectedSessionId],
  );

  const generateBill = async () => {
    try {
      setActionLoading(true);
      const res = await Axios(billApi.generateBySession(selectedSessionId));
      setBill(res.data?.data || null);
      toast.success("Bill generated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate bill");
    } finally {
      setActionLoading(false);
    }
  };

  const payAndClose = async () => {
    if (!bill?._id) return;
    try {
      setActionLoading(true);
      await Axios({
        ...billApi.pay(bill._id),
        data: { paymentMethod },
      });

      await Axios(sessionApi.close(restaurantId, selectedSessionId));

      toast.success("Payment successful & session closed");
      setBill(null);
      await loadSessions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment/close failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cashier Desk</h1>
            <p className="text-sm text-gray-600 mt-1">
              Process payments & close sessions
            </p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            💳 Payments
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Kpi label="Open Sessions" value={sessions.length} />
        <Kpi
          label="Selected Session"
          value={selectedSessionId ? String(selectedSessionId).slice(-6) : "-"}
          tone="orange"
        />
        <Kpi
          label="Current Bill Total"
          value={`₹${Math.round(bill?.total || 0)}`}
          tone="green"
        />
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-500">No active sessions available</p>
        </div>
      ) : (
        <>
          {/* SESSION SELECTOR */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Select Session
            </label>
            <select
              className="mt-3 w-full h-11 border border-gray-300 rounded-xl px-3 text-sm"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              {sessions.map((s) => (
                <option key={s._id} value={String(s._id)}>
                  Table {s.tableId?.tableNumber || "-"} ·{" "}
                  {String(s._id).slice(-6)}
                </option>
              ))}
            </select>

            {/* SESSION INFO */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Info
                label="Table"
                value={selectedSession?.tableId?.tableNumber || "-"}
              />
              <Info label="PIN" value={selectedSession?.tablePin || "-"} />
              <Info
                label="Session"
                value={String(selectedSessionId).slice(-8)}
              />
            </div>
          </div>

          {/* BILL SECTION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Bill Details</h2>
              {!bill ? (
                <button
                  onClick={generateBill}
                  disabled={!selectedSessionId || actionLoading}
                  className="h-10 px-4 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60 transition"
                >
                  {actionLoading ? "Generating..." : "Generate Bill"}
                </button>
              ) : null}
            </div>

            {!bill ? (
              <p className="text-sm text-gray-500 italic">
                No bill generated yet. Click "Generate Bill" to proceed.
              </p>
            ) : (
              <>
                {/* BILL INFO GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <BillInfo
                    label="Subtotal"
                    value={`₹${Math.round(bill.subtotal || 0)}`}
                  />
                  <BillInfo
                    label="Taxes"
                    value={`₹${Math.round(bill.taxes || 0)}`}
                  />
                  <BillInfo
                    label="Total"
                    value={`₹${Math.round(bill.total || 0)}`}
                    isBold
                  />
                  <BillInfo label="Status" value={bill.status} statusBadge />
                </div>

                {/* PAYMENT METHOD */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Payment Method
                  </label>
                  <select
                    className="mt-2 w-full h-11 border border-gray-300 rounded-xl px-3 text-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">💵 Cash</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="CARD">💳 Card</option>
                    <option value="ONLINE">🌐 Online</option>
                  </select>
                </div>

                {/* PAY & CLOSE BUTTON */}
                <button
                  onClick={payAndClose}
                  disabled={actionLoading || bill.status !== "OPEN"}
                  className="w-full h-12 px-4 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition"
                >
                  {actionLoading
                    ? "Processing..."
                    : `Pay ₹${Math.round(bill.total || 0)} & Close`}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : tone === "green"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 break-all mt-1">{value}</p>
    </div>
  );
}

function BillInfo({ label, value, isBold = false, statusBadge = false }) {
  if (statusBadge) {
    const badgeClass =
      value === "OPEN"
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : "bg-green-50 text-green-700 border-green-200";
    return (
      <div className={`border rounded-xl p-3 ${badgeClass}`}>
        <p className="text-[10px] uppercase tracking-wide font-semibold">
          {label}
        </p>
        <p className="text-xs font-bold mt-1">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p
        className={`mt-1 ${isBold ? "text-lg font-bold text-gray-900" : "text-sm font-semibold text-gray-700"}`}
      >
        {" "}
        {value}
      </p>
    </div>
  );
}
