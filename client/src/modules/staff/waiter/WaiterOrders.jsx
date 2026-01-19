import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import sessionApi from "../../../api/session.api";
import orderApi from "../../../api/order.api";

export default function WaiterOrders() {
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  const loadOrders = async (sessionId) => {
    if (!sessionId) return;
    try {
      setLoadingOrders(true);
      const res = await Axios(orderApi.listSessionOrdersStaff(sessionId));
      setOrders(res.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [restaurantId]);

  useEffect(() => {
    loadOrders(selectedSessionId);
  }, [selectedSessionId]);

  const selectedSession = useMemo(
    () => sessions.find((s) => String(s._id) === String(selectedSessionId)) || null,
    [sessions, selectedSessionId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Select an active table session to view orders.
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
            <Info
              label="Last activity"
              value={
                selectedSession?.lastActivityAt
                  ? new Date(selectedSession.lastActivityAt).toLocaleTimeString()
                  : "-"
              }
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loadingOrders ? (
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
        ) : orders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-6 text-gray-600">
            No orders for this session yet.
          </div>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="bg-white border rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Order {String(o._id).slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {o.orderStatus}
                </span>
              </div>

              <div className="mt-3 divide-y">
                {(o.items || []).map((it) => (
                  <div key={it._id} className="py-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {it.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {it.quantity} · Status: {it.itemStatus}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{Math.round((it.price || 0) * (it.quantity || 0))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
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
