import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiRefreshCcw,
  FiSearch,
} from "react-icons/fi";

import { useSocket } from "../../../socket/SocketProvider";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import sessionApi from "../../../api/session.api";

import TableCard from "../../../components/waiter/TableCard";
import SessionInfoModal from "../../../components/waiter/SessionInfoModal";

export default function WaiterDashboard() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pinInfo, setPinInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true);
        const [t, s] = await Promise.all([
          Axios(tableApi.list(restaurantId)),
          Axios(sessionApi.list(restaurantId, { status: "OPEN" })),
        ]);
        setTables(t.data.data || []);
        setSessions(s.data.data || []);
      } catch {
        toast.error("Unable to load table sessions");
      } finally {
        setRefreshing(false);
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
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1 mb-3">
          <FiGrid size={12} /> Waiter Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Table Sessions
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Open sessions, hand over PIN, and track occupied tables.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search table number..."
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-300 text-sm"
            >
              <option value="ALL">All tables</option>
              <option value="FREE">Free</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => load(true)}
              className="w-full h-11 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-orange-100"
            >
              <FiRefreshCcw className={refreshing ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTables.map((table) => {
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
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide font-semibold inline-flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-bold mt-1.5">{value}</p>
    </div>
  );
}
