import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiBell, FiCheckCircle, FiClock } from "react-icons/fi";

import { useSocket } from "../../../socket/SocketProvider";
import WaiterAlertModal from "../../../components/waiter/WaiterAlertModal";

export default function WaiterAlerts() {
  const socket = useSocket();

  const [alerts, setAlerts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const addAlert = (payload = {}) => {
      const alert = {
        id:
          payload.id ||
          `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tableId: payload.tableId,
        tableName: payload.tableName || payload.tableNumber || "Unknown Table",
        reason: payload.reason || "Call button pressed",
        createdAt: payload.createdAt || new Date().toISOString(),
        status: "PENDING",
      };

      setAlerts((prev) => [alert, ...prev]);
      toast.success(`${alert.tableName} called for waiter`, { icon: "🔔" });
    };

    socket.on("table:call-bell", addAlert);
    socket.on("table:call_waiter", addAlert);

    return () => {
      socket.off("table:call-bell", addAlert);
      socket.off("table:call_waiter", addAlert);
    };
  }, [socket]);

  const summary = useMemo(
    () => ({
      total: alerts.length,
      pending: alerts.filter((a) => a.status === "PENDING").length,
      attended: alerts.filter((a) => a.status === "ATTENDED").length,
    }),
    [alerts],
  );

  const acknowledgeAlert = (id) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "ATTENDED", attendedAt: new Date().toISOString() }
          : a,
      ),
    );
    setActiveAlert(null);
    toast.success("Marked as attended");
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900">Call Alerts</h1>
        <p className="text-sm text-gray-600 mt-1">
          Real-time customer assistance requests from table call buttons.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Kpi
          title="Total Alerts"
          value={summary.total}
          tone="neutral"
          icon={<FiBell size={14} />}
        />
        <Kpi
          title="Pending"
          value={summary.pending}
          tone="orange"
          icon={<FiClock size={14} />}
        />
        <Kpi
          title="Attended"
          value={summary.attended}
          tone="green"
          icon={<FiCheckCircle size={14} />}
        />
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-700 font-semibold">No alerts right now</p>
          <p className="text-sm text-gray-500 mt-1">
            New customer calls will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => setActiveAlert(alert)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {alert.tableName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{alert.reason}</p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide border ${
                    alert.status === "ATTENDED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {alert.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <WaiterAlertModal
        alert={activeAlert}
        onClose={() => setActiveAlert(null)}
        onAcknowledge={acknowledgeAlert}
      />
    </div>
  );
}

function Kpi({ title, value, icon, tone = "neutral" }) {
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
        {title}
      </p>
      <p className="text-2xl font-bold mt-1.5">{value}</p>
    </div>
  );
}
