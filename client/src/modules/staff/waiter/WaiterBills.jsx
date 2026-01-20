import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import sessionApi from "../../../api/session.api";
import billApi from "../../../api/bill.api";

export default function WaiterBills() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const loadSessions = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await Axios(sessionApi.list(restaurantId, { status: "OPEN" }));
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

  const selectedSession = useMemo(
    () => sessions.find((s) => String(s._id) === String(selectedSessionId)) || null,
    [sessions, selectedSessionId]
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

      // close session (requires all orders PAID)
      await Axios({
        ...sessionApi.close(restaurantId, selectedSessionId),
      });

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>
          <p className="text-sm text-gray-600 mt-1">
            Generate bill for a session, take payment, then close the session.
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
      ) : sessions.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          No active sessions.
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-4">
          <label className="text-xs font-medium text-gray-600">Session</label>
          <select
            className="mt-1 w-full h-11 border rounded-lg px-3 text-sm"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
          >
            {sessions.map((s) => (
              <option key={s._id} value={String(s._id)}>
                Table {s.tableId?.tableNumber || "-"} · {String(s._id).slice(-6)}
              </option>
            ))}
          </select>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
            <Info label="Table" value={selectedSession?.tableId?.tableNumber || "-"} />
            <Info label="PIN" value={selectedSession?.tablePin || "-"} />
            <Info label="Session" value={String(selectedSessionId).slice(-8)} />
          </div>
        </div>
      )}

      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Bill</h2>
          {!bill ? (
            <button
              onClick={generateBill}
              disabled={!selectedSessionId || actionLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {actionLoading ? "Generating..." : "Generate Bill"}
            </button>
          ) : null}
        </div>

        {!bill ? (
          <p className="mt-3 text-sm text-gray-600">No bill generated yet.</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Info label="Subtotal" value={`₹${Math.round(bill.subtotal || 0)}`} />
              <Info label="Taxes" value={`₹${Math.round(bill.taxes || 0)}`} />
              <Info label="Total" value={`₹${Math.round(bill.total || 0)}`} />
              <Info label="Status" value={bill.status} />
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600">Payment method</label>
              <select
                className="mt-1 w-full h-11 border rounded-lg px-3 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            <button
              onClick={payAndClose}
              disabled={actionLoading || bill.status !== "OPEN"}
              className="mt-4 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {actionLoading ? "Processing..." : "Pay & Close Session"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-3">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-900 break-all">{value}</p>
    </div>
  );
}
