import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiDownload,
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi";

// Helper to get auth token
const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
};

export default function WaiterAlertHistory() {
  const [dateSlot, setDateSlot] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [view, setView] = useState("daily"); // "daily" or "analytics"
  const [loading, setLoading] = useState(false);
  const [alertsByTimeSlot, setAlertsByTimeSlot] = useState({});
  const [alertStats, setAlertStats] = useState({});
  const [analyticsData, setAnalyticsData] = useState(null);
  const [exportFormat, setExportFormat] = useState("json"); // "json" or "csv"

  // ===== FETCH DAILY ALERTS =====
  const fetchDailyAlerts = async () => {
    if (!dateSlot) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/waiter/alerts/daily?dateSlot=${dateSlot}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch daily alerts");

      const data = await response.json();
      if (data.success) {
        setAlertsByTimeSlot(data.data.alertsByTimeSlot || {});
        setAlertStats(data.data.stats || {});
        toast.success("Daily alerts loaded ✓");
      }
    } catch (err) {
      console.error("Error fetching daily alerts:", err);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH ANALYTICS =====
  const fetchAnalytics = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select date range");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/waiter/alerts/analytics?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
        toast.success("Analytics loaded ✓");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // ===== EXPORT ALERTS =====
  const exportAlerts = async () => {
    if (view === "daily" && !dateSlot) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("format", exportFormat);
      if (view === "daily") {
        params.append("dateSlot", dateSlot);
      }

      const response = await fetch(`/api/waiter/alerts/export?${params}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to export");

      if (exportFormat === "csv") {
        const csv = await response.text();
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `alerts_${dateSlot || "all"}.csv`;
        a.click();
      } else {
        const json = await response.json();
        const blob = new Blob([JSON.stringify(json, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `alerts_${dateSlot || "all"}.json`;
        a.click();
      }

      toast.success("Exported successfully ✓");
    } catch (err) {
      console.error("Error exporting:", err);
      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Alert History
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          View and manage waiter call alerts for audit and analysis
        </p>
      </div>

      {/* VIEW TABS */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setView("daily")}
            className={`flex-1 min-w-[120px] px-3 sm:px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${
              view === "daily"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiCalendar className="inline" size={16} />
              <span>Daily View</span>
            </div>
          </button>
          <button
            onClick={() => setView("analytics")}
            className={`flex-1 min-w-[120px] px-3 sm:px-4 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${
              view === "analytics"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiBarChart2 className="inline" size={16} />
              <span>Analytics</span>
            </div>
          </button>
        </div>

        {/* ===== DAILY VIEW ===== */}
        {view === "daily" && (
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* DATE & EXPORT CONTROLS */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={dateSlot}
                    onChange={(e) => setDateSlot(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={fetchDailyAlerts}
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? "Loading..." : "Load"}
                </button>

                <div className="flex gap-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="flex-1 sm:flex-initial px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                  <button
                    onClick={exportAlerts}
                    disabled={loading || !dateSlot}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    <FiDownload size={16} />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DAILY STATS */}
            {Object.keys(alertStats).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title="Total Alerts"
                  value={alertStats.totalAlerts}
                  color="blue"
                />
                <StatCard
                  title="Attended"
                  value={alertStats.attended}
                  color="green"
                />
                <StatCard
                  title="Pending"
                  value={alertStats.pending}
                  color="orange"
                />
                <StatCard
                  title="Avg Response (s)"
                  value={(alertStats.avgResponseTimeMs / 1000).toFixed(1)}
                  color="purple"
                />
              </div>
            )}

            {/* TIME SLOT GROUPING */}
            {Object.keys(alertsByTimeSlot).length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(alertsByTimeSlot)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([timeSlot, alerts]) => (
                    <TimeSlotCard
                      key={timeSlot}
                      timeSlot={timeSlot}
                      alerts={alerts}
                    />
                  ))}
              </div>
            ) : (
              !loading && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
                  <p className="text-sm sm:text-base text-gray-600">
                    No alerts found for {dateSlot}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* ===== ANALYTICS VIEW ===== */}
        {view === "analytics" && (
          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* DATE RANGE & ANALYTICS CONTROLS */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? "Loading..." : "Analyze"}
                </button>
              </div>
            </div>

            {/* ANALYTICS STATS */}
            {analyticsData && analyticsData.stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title="Total Alerts"
                  value={analyticsData.stats.totalAlerts}
                  color="blue"
                />
                <StatCard
                  title="Attended"
                  value={analyticsData.stats.attendedAlerts}
                  color="green"
                />
                <StatCard
                  title="Pending"
                  value={analyticsData.stats.pendingAlerts}
                  color="orange"
                />
                <StatCard
                  title="Avg Response (s)"
                  value={(analyticsData.stats.avgResponseTimeMs / 1000).toFixed(
                    1,
                  )}
                  color="purple"
                />
              </div>
            )}

            {/* ALERTS BY TABLE */}
            {analyticsData && analyticsData.alertsByTable && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Alerts by Table
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">
                          Table
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-700">
                          Count
                        </th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-700">
                          Attended
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analyticsData.alertsByTable)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([table, data]) => (
                          <tr key={table} className="border-b border-gray-100">
                            <td className="py-3 px-3 text-gray-900 font-semibold">
                              {table}
                            </td>
                            <td className="text-right py-3 px-3 text-gray-700">
                              {data.count}
                            </td>
                            <td className="text-right py-3 px-3 text-green-600 font-semibold">
                              {
                                data.alerts.filter(
                                  (a) => a.status === "ATTENDED",
                                ).length
                              }
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <p className="text-[10px] sm:text-xs uppercase tracking-wide font-semibold truncate">{title}</p>
      <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-1.5">{value}</p>
    </div>
  );
}

function TimeSlotCard({ timeSlot, alerts }) {
  const attended = alerts.filter((a) => a.status === "ATTENDED").length;
  const pending = alerts.filter((a) => a.status === "PENDING").length;
  const avgResponse =
    alerts.filter((a) => a.responseTimeMs).length > 0
      ? Math.round(
          alerts
            .filter((a) => a.responseTimeMs)
            .reduce((sum, a) => sum + a.responseTimeMs, 0) /
            alerts.filter((a) => a.responseTimeMs).length,
        )
      : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <FiTrendingUp className="text-blue-600" size={18} />
          {timeSlot}
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="px-2.5 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold whitespace-nowrap">
            {pending} Pending
          </span>
          <span className="px-2.5 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold whitespace-nowrap">
            {attended} Attended
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {alert.tableName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{alert.reason}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {new Date(alert.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2">
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase whitespace-nowrap ${
                  alert.status === "ATTENDED"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {alert.status}
              </span>
              {alert.responseTimeMs && (
                <p className="text-xs text-gray-600">
                  {(alert.responseTimeMs / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
