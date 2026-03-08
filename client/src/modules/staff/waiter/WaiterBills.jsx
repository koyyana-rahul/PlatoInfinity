import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiFileText, FiRefreshCcw } from "react-icons/fi";

import Axios from "../../../api/axios";
import sessionApi from "../../../api/session.api";
import billApi from "../../../api/bill.api";
import BillSummary from "../../../components/waiter/BillSummary";

export default function WaiterBills() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = async (silent = false) => {
    if (!restaurantId) return;
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const res = await Axios(
        sessionApi.list(restaurantId, { status: "OPEN" }),
      );
      const data = res.data?.data || [];
      setSessions(data);

      if (!selectedSessionId && data.length) {
        setSelectedSessionId(String(data[0]._id));
      }
    } catch {
      toast.error("Unable to load open sessions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBill = async (sessionId) => {
    if (!sessionId) {
      setBill(null);
      return;
    }

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
    () =>
      sessions.find((s) => String(s._id) === String(selectedSessionId)) || null,
    [sessions, selectedSessionId],
  );

  const generateBill = async () => {
    if (!selectedSessionId) {
      toast.error("Select a session first");
      return;
    }

    try {
      setGenerating(true);
      const res = await Axios(billApi.generateBySession(selectedSessionId));
      setBill(res.data?.data || null);
      toast.success("Bill generated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate bill");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
        <p className="text-sm text-gray-600 mt-1">
          Prepare table bills before cashier settlement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            Open Sessions
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {sessions.length}
          </p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">
            Current Session
          </p>
          <p className="text-sm font-bold text-orange-900 mt-2 break-all">
            {selectedSessionId ? String(selectedSessionId).slice(-8) : "-"}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs uppercase tracking-wide text-green-700 font-semibold">
            Current Bill
          </p>
          <p className="text-2xl font-bold text-green-800 mt-1">
            ₹{Math.round(bill?.total || 0)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
        {loading ? (
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-600">No active sessions available.</p>
        ) : (
          <>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Select Session
              </label>
              <select
                className="mt-1 w-full h-11 border border-gray-300 rounded-xl px-3 text-sm"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
              <Info
                label="Table"
                value={selectedSession?.tableId?.tableNumber || "-"}
              />
              <Info label="PIN" value={selectedSession?.tablePin || "-"} />
              <Info label="Status" value={selectedSession ? "OPEN" : "-"} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={generateBill}
                disabled={generating || !selectedSessionId}
                className="h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                <FiFileText size={14} />{" "}
                {generating
                  ? "Generating..."
                  : bill
                    ? "Regenerate Bill"
                    : "Generate Bill"}
              </button>
              <button
                onClick={() => loadSessions(true)}
                className="h-11 px-4 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <FiRefreshCcw
                  className={refreshing ? "animate-spin" : ""}
                  size={14}
                />{" "}
                Refresh
              </button>
            </div>
          </>
        )}
      </div>

      {!bill ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 text-gray-600">
          Select a session and generate bill to view totals.
        </div>
      ) : (
        <BillSummary bill={bill} />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xs font-semibold text-gray-900 mt-1 break-all">
        {value}
      </p>
    </div>
  );
}
