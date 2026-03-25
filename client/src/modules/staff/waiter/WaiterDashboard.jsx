import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiGrid, FiCheckCircle, FiClock, FiSearch } from "react-icons/fi";

import { useSocket } from "../../../socket/SocketProvider";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import sessionApi from "../../../api/session.api";

import TableCard from "../../../components/waiter/TableCard";
import SessionInfoModal from "../../../components/waiter/SessionInfoModal";
import Dropdown from "../../../components/ui/DropDown";

export default function WaiterDashboard() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pinInfo, setPinInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [t, s] = await Promise.all([
          Axios(tableApi.list(restaurantId)),
          Axios(sessionApi.list(restaurantId, { status: "OPEN" })),
        ]);
        setTables(t.data.data || []);
        setSessions(s.data.data || []);
      } catch {
        toast.error("Unable to load table sessions");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [restaurantId],
  );

  const socket = useSocket();

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    const handleSessionOpened = (newSession) => {
      setSessions((prev) => [...prev, newSession]);
      setTables((prev) =>
        prev.map((t) =>
          t._id === newSession.tableId._id ? { ...t, status: "OCCUPIED" } : t,
        ),
      );
    };

    const handleSessionClosed = ({ sessionId, tableId }) => {
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status: "FREE" } : t)),
      );
    };

    socket.on("session:opened", handleSessionOpened);
    socket.on("session:closed", handleSessionClosed);

    const handleOrderLifecycle = () => {
      // Keep table/session grid in sync with order-driven session/table transitions.
      load(true);
    };

    socket.on("order:placed", handleOrderLifecycle);
    socket.on("order:status-changed", handleOrderLifecycle);
    socket.on("order:served", handleOrderLifecycle);
    socket.on("order:cancelled", handleOrderLifecycle);
    socket.on("table:status-changed", handleOrderLifecycle);
    socket.on("table:status-updated", handleOrderLifecycle);
    socket.on("table:status_changed", handleOrderLifecycle);
    socket.on("table:availability", handleOrderLifecycle);
    socket.on("table:update", handleOrderLifecycle);
    socket.on("session:update", handleOrderLifecycle);
    socket.on("connect", handleOrderLifecycle);

    return () => {
      socket.off("session:opened", handleSessionOpened);
      socket.off("session:closed", handleSessionClosed);
      socket.off("order:placed", handleOrderLifecycle);
      socket.off("order:status-changed", handleOrderLifecycle);
      socket.off("order:served", handleOrderLifecycle);
      socket.off("order:cancelled", handleOrderLifecycle);
      socket.off("table:status-changed", handleOrderLifecycle);
      socket.off("table:status-updated", handleOrderLifecycle);
      socket.off("table:status_changed", handleOrderLifecycle);
      socket.off("table:availability", handleOrderLifecycle);
      socket.off("table:update", handleOrderLifecycle);
      socket.off("session:update", handleOrderLifecycle);
      socket.off("connect", handleOrderLifecycle);
    };
  }, [socket, load]);

  const sessionByTable = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      if (s.tableId) {
        map.set(String(s.tableId._id), s);
      }
    });
    return map;
  }, [sessions]);

  const openSession = async (tableId) => {
    try {
      const res = await Axios({
        ...sessionApi.open(restaurantId),
        data: { tableId },
      });
      setPinInfo(res.data.data);
      toast.success("Session opened");

      // 🔥 Optimistic update: immediately update local state
      // The socket event will also update, but this ensures instant feedback
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status: "OCCUPIED" } : t)),
      );

      // 🔄 Refetch sessions to get the complete session data
      // This ensures the UI is updated even if socket event is delayed/missed
      const sessionsRes = await Axios(
        sessionApi.list(restaurantId, { status: "OPEN" }),
      );
      setSessions(sessionsRes.data.data || []);
    } catch (err) {
      console.error("Failed to open session:", err);
      toast.error(err.response?.data?.message || "Failed to open session");
    }
  };

  const handleViewPin = async (session) => {
    if (!session) return;
    setPinInfo({ tablePin: session.tablePin });
    try {
      await Axios(sessionApi.logPinHandover(restaurantId, session._id));
    } catch (err) {
      console.error("Failed to log PIN handover:", err);
    }
  };

  const visibleTables = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tables.filter((t) => {
      const hasSession = sessionByTable.has(String(t._id));
      const statusPass =
        filter === "ALL" ||
        (filter === "OCCUPIED" && hasSession) ||
        (filter === "FREE" && !hasSession);
      const searchPass = !q || (t.tableNumber || "").toLowerCase().includes(q);
      return statusPass && searchPass;
    });
  }, [tables, sessionByTable, filter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
          <div className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5 mb-1.5">
            <FiGrid size={12} /> Waiter Console
          </div>
          <h1 className="text-[15px] sm:text-xl font-black text-slate-900">
            Table Sessions
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Open sessions, hand over PIN, and track occupied tables.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`stat-shimmer-${idx}`}
                className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white"
              >
                <div className="h-3 w-24 bg-slate-100 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-slate-100 rounded-xl mt-3 animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Total"
                value={tables.length}
                icon={<FiGrid size={14} />}
                tone="neutral"
              />
              <StatCard
                label="Occupied"
                value={sessions.length}
                icon={<FiClock size={14} />}
                tone="orange"
              />
              <StatCard
                label="Available"
                value={Math.max(tables.length - sessions.length, 0)}
                icon={<FiCheckCircle size={14} />}
                tone="green"
              />
            </>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search table number..."
                className="w-full h-12 pl-10 pr-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 shadow-sm"
              />
            </div>

            <div className="md:col-span-4">
              <Dropdown
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "ALL", label: "All tables" },
                  { value: "FREE", label: "Free" },
                  { value: "OCCUPIED", label: "Occupied" },
                ]}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live updates
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`table-shimmer-${idx}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-slate-100 rounded-full animate-pulse" />
                      <div className="h-3 w-16 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                    <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-slate-100 rounded-2xl mt-4 animate-pulse" />
                </div>
              ))
            : visibleTables.map((table) => {
                const session = sessionByTable.get(String(table._id));
                return (
                  <TableCard
                    key={table._id}
                    table={table}
                    activeSession={session}
                    onOpen={() => openSession(table._id)}
                    onViewPin={handleViewPin}
                  />
                );
              })}
        </div>

        <SessionInfoModal info={pinInfo} onClose={() => setPinInfo(null)} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, tone = "neutral" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 border-green-200 text-green-700"
      : tone === "orange"
        ? "bg-orange-50 border-orange-200 text-orange-700"
        : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-bold mt-1.5 text-slate-900">{value}</p>
    </div>
  );
}
