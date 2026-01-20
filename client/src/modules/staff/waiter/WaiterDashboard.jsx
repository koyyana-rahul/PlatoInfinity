import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import sessionApi from "../../../api/session.api";
import Modal from "../../../components/ui/Modal";

export default function WaiterDashboard() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openInfo, setOpenInfo] = useState(null);

  const load = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const [tRes, sRes] = await Promise.all([
        Axios(tableApi.list(restaurantId)),
        Axios(sessionApi.list(restaurantId, { status: "OPEN" })),
      ]);
      setTables(tRes.data?.data || []);
      setSessions(sRes.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId]);

  const sessionsByTableId = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const tid = s.tableId?._id || s.tableId;
      if (tid) map.set(String(tid), s);
    }
    return map;
  }, [sessions]);

  const openSession = async (tableId) => {
    try {
      const res = await Axios({
        ...sessionApi.open(restaurantId),
        data: { tableId },
      });
      const data = res.data?.data;
      setOpenInfo(data);
      toast.success("Session opened");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to open session");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tables</h1>
          <p className="text-sm text-gray-600 mt-1">
            Open a session for a free table, then customers can join via PIN.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          No tables found. Ask manager to create tables.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((t) => {
            const activeSession = sessionsByTableId.get(String(t._id));
            const isFree = t.status === "FREE" && !activeSession;

            return (
              <div
                key={t._id}
                className="bg-white border rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Table {t.tableNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      Seats: {t.seatingCapacity}
                    </p>
                  </div>
                  <span
                    className={
                      "px-2 py-1 rounded-full text-xs font-medium " +
                      (activeSession
                        ? "bg-amber-100 text-amber-700"
                        : t.status === "FREE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-700")
                    }
                  >
                    {activeSession ? "SESSION OPEN" : t.status}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setOpenInfo(activeSession ? {
                      sessionId: activeSession._id,
                      tablePin: activeSession.tablePin,
                      sessionToken: "",
                    } : null)}
                    disabled={!activeSession}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border hover:bg-gray-50 disabled:opacity-50"
                  >
                    Session Info
                  </button>

                  <button
                    onClick={() => openSession(t._id)}
                    disabled={!isFree}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Open Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openInfo && (
        <Modal title="Session Info" onClose={() => setOpenInfo(null)}>
          <div className="space-y-3">
            <InfoRow label="Session ID" value={openInfo.sessionId} />
            <InfoRow label="Table PIN" value={openInfo.tablePin} />
            {openInfo.sessionToken ? (
              <InfoRow label="Session Token" value={openInfo.sessionToken} />
            ) : null}
            <p className="text-xs text-gray-500">
              Table PIN is used by customers to join the session.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-900 break-all text-right">
        {value}
      </span>
    </div>
  );
}
