import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { FiBell, FiCheckCircle, FiClock } from "react-icons/fi";

import { useSocket } from "../../../socket/SocketProvider";
import WaiterAlertModal from "../../../components/waiter/WaiterAlertModal";

const ALERTS_STORAGE_KEY = "plato:waiter:alerts";
const MAX_STORED_ALERTS = 50; // Keep max 50 alerts in localStorage
const DUPLICATE_THRESHOLD_MS = 500; // Ignore duplicate alerts within 500ms

const inferAlertType = (reason = "") => {
  const normalized = String(reason).toUpperCase();
  if (normalized.includes("BILL")) return "BILL_REQUEST";
  if (normalized.includes("PIN") || normalized.includes("ORDER")) {
    return "TABLE_PIN";
  }
  return "GENERAL";
};

// Create audio context for alert sound
const createAlertSound = () => {
  // Simple beep tone using Web Audio API (fallback to audio file if available)
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    return () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
  } catch (err) {
    console.warn("Audio context not available:", err);
    return () => {}; // No-op fallback
  }
};

const playAlertSound = createAlertSound();

// Request notification permission
const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

// Show browser notification
const showBrowserNotification = (tableName, reason) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🔔 Waiter Needed!", {
      body: `Table ${tableName} - ${reason}`,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>🔔</text></svg>",
      tag: "waiter-alert", // Replace previous notifications
      requireInteraction: true, // Don't auto-close
      badge:
        "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23f97316'/><text y='70' font-size='60' text-anchor='middle' fill='white'>!</text></svg>",
    });
  }
};

// Helper: Load alerts from localStorage
function loadAlertsFromStorage() {
  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      const alerts = JSON.parse(stored);
      console.log(`📂 Loaded ${alerts.length} alerts from localStorage`);
      return alerts;
    }
  } catch (err) {
    console.error("❌ Error loading alerts from localStorage:", err);
  }
  return [];
}

// Helper: Save alerts to localStorage
function saveAlertsToStorage(alerts) {
  try {
    // Keep only most recent alerts
    const recentAlerts = alerts.slice(0, MAX_STORED_ALERTS);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(recentAlerts));
    console.log(`💾 Saved ${recentAlerts.length} alerts to localStorage`);
  } catch (err) {
    console.error("❌ Error saving alerts to localStorage:", err);
  }
}

export default function WaiterAlerts() {
  const socket = useSocket();

  // Initialize from localStorage
  const [alerts, setAlerts] = useState(() => loadAlertsFromStorage());
  const [activeAlert, setActiveAlert] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "attended"
  const [activeTypeTab, setActiveTypeTab] = useState("all"); // "all" | "TABLE_PIN" | "BILL_REQUEST"

  // Track recent alerts to prevent duplicates (from 3 event broadcasts)
  const recentAlertsRef = useRef({});

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Fetch historical alerts from database on mount
  useEffect(() => {
    const fetchHistoricalAlerts = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const token =
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("authToken");

        console.log("📥 Fetching historical alerts for date:", today);
        console.log("🔑 Token available:", !!token);

        const response = await fetch(
          `/api/waiter/alerts/time-slot?dateSlot=${today}&status=ALL&limit=50`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          },
        );

        console.log("📡 Historical alerts response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📦 Historical alerts data:", data);

          if (data.success && data.data?.alerts) {
            const historicalAlerts = data.data.alerts.map((alert) => ({
              id: alert._id,
              tableId: alert.tableId,
              tableName: alert.tableName,
              reason: alert.reason,
              alertType: alert.alertType || inferAlertType(alert.reason),
              createdAt: alert.createdAt,
              status: alert.status,
              attendedAt: alert.attendedAt,
              attendedByWaiterId: alert.attendedByWaiterId,
            }));

            console.log(
              `✅ Loaded ${historicalAlerts.length} alerts from database`,
            );

            // Merge with localStorage (database is source of truth)
            setAlerts((prev) => {
              const merged = [...historicalAlerts];
              // Add any localStorage alerts that aren't in database
              prev.forEach((localAlert) => {
                if (!merged.find((a) => a.id === localAlert.id)) {
                  merged.push(localAlert);
                }
              });
              return merged.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
              );
            });
            setLastSyncedAt(new Date().toISOString());
          } else {
            console.log("ℹ️ No alerts found in database response");
          }
        } else {
          const errorData = await response.text();
          console.error(
            "❌ Failed to fetch alerts. Status:",
            response.status,
            "Response:",
            errorData,
          );
        }
      } catch (err) {
        console.error("❌ Error fetching historical alerts:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoricalAlerts();
  }, []);

  // Refresh alerts from database
  const refreshAlerts = async ({ silent = false } = {}) => {
    if (isRefreshing || isLoadingHistory) {
      return;
    }
    setIsRefreshing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      const status =
        activeTab === "pending"
          ? "PENDING"
          : activeTab === "attended"
            ? "ATTENDED"
            : "ALL";

      console.log("🔄 Refreshing alerts with status:", status);

      const response = await fetch(
        `/api/waiter/alerts/time-slot?dateSlot=${today}&status=${status}&limit=100`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data?.alerts) {
          const refreshedAlerts = data.data.alerts.map((alert) => ({
            id: alert._id,
            tableId: alert.tableId,
            tableName: alert.tableName,
            reason: alert.reason,
            alertType: alert.alertType || inferAlertType(alert.reason),
            createdAt: alert.createdAt,
            status: alert.status,
            attendedAt: alert.attendedAt,
            attendedByWaiterId: alert.attendedByWaiterId,
          }));

          console.log(
            `✅ Refreshed ${refreshedAlerts.length} alerts from database`,
          );

          // If filtering by specific status, merge with existing alerts of other statuses
          if (status !== "ALL") {
            setAlerts((prev) => {
              // Keep alerts of other status
              const otherStatusAlerts = prev.filter((a) => a.status !== status);
              // Merge with refreshed alerts
              const merged = [...refreshedAlerts, ...otherStatusAlerts];
              return merged.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
              );
            });
          } else {
            setAlerts(
              refreshedAlerts.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
              ),
            );
          }

          setLastSyncedAt(new Date().toISOString());

          if (!silent) {
            toast.success("Alerts refreshed ✓");
          }
        }
      }
    } catch (err) {
      console.error("❌ Error refreshing alerts:", err);
      if (!silent) {
        toast.error("Failed to refresh alerts");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Save to localStorage whenever alerts change
  useEffect(() => {
    saveAlertsToStorage(alerts);
  }, [alerts]);

  // Update page title with alert count
  useEffect(() => {
    const pendingCount = alerts.filter((a) => a.status === "PENDING").length;
    if (pendingCount > 0) {
      document.title = `(${pendingCount}) 🔔 Waiter Alerts`;
    } else {
      document.title = "Waiter Alerts";
    }
  }, [alerts]);

  useEffect(() => {
    if (!socket) {
      console.warn("⚠️ WaiterAlerts: socket not available");
      return;
    }

    console.log("✅ WaiterAlerts: Setting up listeners on socket:", socket.id);

    // Wait for socket to be connected before setting up listeners
    const setupListeners = () => {
      const addAlert = (payload = {}) => {
        console.log("🔔 Waiter alert received:", payload);

        // DEDUPLICATION: Check if we've seen this tableId recently
        const tableId = String(payload.tableId);
        const now = Date.now();
        const lastAlertTime = recentAlertsRef.current[tableId];

        if (lastAlertTime && now - lastAlertTime < DUPLICATE_THRESHOLD_MS) {
          console.warn(
            `⏭️ Skipping duplicate alert for table ${tableId} (received ${now - lastAlertTime}ms ago)`,
          );
          return; // Ignore duplicate
        }

        // Mark this tableId as recently alerted
        recentAlertsRef.current[tableId] = now;

        const alert = {
          id:
            payload.alertId ||
            payload.id ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          tableId: payload.tableId,
          tableName:
            payload.tableName || payload.tableNumber || "Unknown Table",
          reason: payload.reason || "Call button pressed",
          alertType:
            payload.alertType || inferAlertType(payload.reason || "GENERAL"),
          createdAt:
            payload.createdAt || payload.timestamp || new Date().toISOString(),
          status: "PENDING",
        };

        console.log("✅ Adding alert in UI:", alert);
        setAlerts((prev) => [alert, ...prev]);

        // Play alert sound
        playAlertSound();

        // Show browser notification
        showBrowserNotification(alert.tableName, alert.reason);

        // Show toast notification
        toast.success(`${alert.tableName} called for waiter 🔔`, {
          icon: "🔔",
        });
      };

      const events = [
        "table:call-bell",
        "table:call_waiter",
        "table:waiter_called",
      ];
      events.forEach((event) => {
        socket.on(event, addAlert);
        console.log("📌 Listener registered for:", event);
      });

      // Periodic cleanup of old entries in recentAlertsRef
      const cleanupInterval = setInterval(() => {
        const now = Date.now();
        Object.keys(recentAlertsRef.current).forEach((tableId) => {
          if (now - recentAlertsRef.current[tableId] > 2000) {
            delete recentAlertsRef.current[tableId];
          }
        });
      }, 1000);

      return () => {
        clearInterval(cleanupInterval);
        events.forEach((event) => {
          socket.off(event, addAlert);
          console.log("🗑️ Listener removed for:", event);
        });
      };
    };

    // If socket is already connected, setup immediately
    if (socket.connected) {
      console.log("✅ Socket already connected, setting up listeners now");
      return setupListeners();
    }

    // Otherwise wait for connect event
    const handleConnect = () => {
      console.log("✅ Socket connected event received, setting up listeners");
      return setupListeners();
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    refreshAlerts({ silent: true });
    const intervalId = setInterval(() => {
      refreshAlerts({ silent: true });
    }, 8000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const handleVisibilityRefresh = () => {
      if (document.visibilityState === "visible") {
        refreshAlerts({ silent: true });
      }
    };
    const handleWindowFocus = () => refreshAlerts({ silent: true });
    const handleOnline = () => refreshAlerts({ silent: true });

    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("online", handleOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const summary = useMemo(
    () => ({
      total: alerts.length,
      pending: alerts.filter((a) => a.status === "PENDING").length,
      attended: alerts.filter((a) => a.status === "ATTENDED").length,
      tablePin: alerts.filter((a) => a.alertType === "TABLE_PIN").length,
      billRequest: alerts.filter((a) => a.alertType === "BILL_REQUEST").length,
    }),
    [alerts],
  );

  // Filter alerts based on active tab
  const filteredAlerts = useMemo(() => {
    const byStatus =
      activeTab === "pending"
        ? alerts.filter((a) => a.status === "PENDING")
        : activeTab === "attended"
          ? alerts.filter((a) => a.status === "ATTENDED")
          : alerts;

    if (activeTypeTab === "all") return byStatus;
    return byStatus.filter((a) => a.alertType === activeTypeTab);
  }, [alerts, activeTab, activeTypeTab]);

  const acknowledgeAlert = async (id) => {
    console.log("✅ Acknowledging alert:", id);

    // Update local state
    setAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === id
          ? { ...a, status: "ATTENDED", attendedAt: new Date().toISOString() }
          : a,
      );
      return updated;
    });

    // Call API to persist acknowledgement to database
    try {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("authToken");

      const response = await fetch(`/api/waiter/alerts/${id}/acknowledge`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        console.log("✅ Alert acknowledged in database");
        toast.success("Marked as attended ✓");
      } else {
        console.error("❌ Failed to acknowledge alert in database");
        toast.error("Failed to save acknowledgement");
      }
    } catch (err) {
      console.error("❌ Error acknowledging alert:", err);
      toast.error("Error saving acknowledgement");
    }

    setActiveAlert(null);
  };

  const showShimmer = isLoadingHistory && alerts.length === 0;

  return (
    <div className="space-y-4 sm:space-y-5 p-3 sm:p-5 lg:p-6 min-h-screen bg-gradient-to-b from-gray-50 to-slate-100/70">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm motion-safe:transition-all motion-safe:duration-300">
        <div className="space-y-1">
          {showShimmer ? (
            <div className="space-y-2">
              <div className="h-5 w-28 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3 w-64 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3 w-52 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Call Alerts
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Real-time customer assistance requests from table call buttons.
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                📊 All alerts stored in database for audit & reporting
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pt-1">
                ⟳ Auto-refresh every 8s
                {lastSyncedAt
                  ? ` • Last sync ${new Date(lastSyncedAt).toLocaleTimeString()}`
                  : ""}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {showShimmer ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`alert-kpi-shimmer-${idx}`}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-100 rounded-xl mt-3 animate-pulse" />
            </div>
          ))
        ) : (
          <>
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
              className="col-span-2 sm:col-span-1"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {showShimmer ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`alert-subkpi-shimmer-${idx}`}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-100 rounded-xl mt-3 animate-pulse" />
            </div>
          ))
        ) : (
          <>
            <Kpi
              title="Table PIN Alerts"
              value={summary.tablePin}
              tone="neutral"
            />
            <Kpi
              title="Bill Alerts"
              value={summary.billRequest}
              tone="neutral"
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-3 sm:px-4 py-2 bg-gray-50">
          <div className="flex overflow-x-auto flex-1">
            {showShimmer ? (
              <div className="flex gap-2 py-2">
                <div className="h-9 w-32 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-9 w-32 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`flex-1 min-w-[120px] px-3 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${
                    activeTab === "pending"
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiClock size={16} />
                    <span className="hidden sm:inline">Pending</span>
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold rounded-full bg-orange-500 text-white">
                      {summary.pending}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("attended")}
                  className={`flex-1 min-w-[120px] px-3 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${
                    activeTab === "attended"
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiCheckCircle size={16} />
                    <span className="hidden sm:inline">Attended</span>
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold rounded-full bg-green-500 text-white">
                      {summary.attended}
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>
          <span className="ml-2 sm:ml-3 inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-full whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live updates on
          </span>
        </div>

        <div className="flex gap-2 px-4 py-2 border-b border-gray-100 bg-white overflow-x-auto">
          {showShimmer ? (
            <div className="flex gap-2 py-1">
              <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ) : (
            [
              { key: "all", label: "All Types" },
              { key: "TABLE_PIN", label: "Table PIN" },
              { key: "BILL_REQUEST", label: "Bill" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTypeTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${
                  activeTypeTab === tab.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))
          )}
        </div>

        {/* Alert List */}
        <div className="p-3 sm:p-6">
          {showShimmer ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`alert-card-shimmer-${idx}`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-48 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-40 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : isLoadingHistory ? (
            <div className="p-8 text-center">
              <p className="text-gray-700 font-semibold">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-700 font-semibold">
                {activeTab === "pending"
                  ? "No pending alerts"
                  : "No attended alerts"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === "pending"
                  ? "New customer calls will appear here automatically."
                  : "Acknowledged alerts will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {filteredAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setActiveAlert(alert)}
                  className="w-full text-left bg-gray-50/90 hover:bg-white border border-gray-200 rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] sm:text-base font-bold text-gray-900 truncate tracking-tight">
                        {alert.tableName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        {alert.reason}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-[11px] text-gray-500">
                        <span>
                          🕐 {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                        {alert.alertType === "TABLE_PIN" && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                            TABLE PIN
                          </span>
                        )}
                        {alert.alertType === "BILL_REQUEST" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            BILL
                          </span>
                        )}
                        {alert.attendedAt && (
                          <span className="text-green-600">
                            ✓ {new Date(alert.attendedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide border self-start ${
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
        </div>
      </div>

      <WaiterAlertModal
        alert={activeAlert}
        onClose={() => setActiveAlert(null)}
        onAcknowledge={acknowledgeAlert}
      />
    </div>
  );
}

function Kpi({ title, value, icon, tone = "neutral", className = "" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 border-green-200 text-green-700"
      : tone === "orange"
        ? "bg-orange-50 border-orange-200 text-orange-700"
        : "bg-white border-gray-200 text-gray-700";

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 shadow-sm motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 ${toneClass} ${className}`}
    >
      <p className="text-[11px] sm:text-xs uppercase tracking-wide font-semibold inline-flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      <p className="text-[26px] leading-none font-extrabold mt-2">{value}</p>
    </div>
  );
}
