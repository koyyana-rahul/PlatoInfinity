import { useEffect, useState } from "react";
import dashboardService from "../../../api/dashboard.service.js";

export function useOpsAlerts(
  timeRange = "today",
  restaurantId = null,
  thresholdMinutes = 20,
) {
  const [alerts, setAlerts] = useState({
    pendingOrders: 0,
    overdueOrders: 0,
    avgPendingAgeMinutes: 0,
    cancelledOrders: 0,
    cancellationRate: 0,
    thresholdMinutes,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpsAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getOpsAlerts(
        timeRange,
        restaurantId,
        thresholdMinutes,
      );
      if (response?.data) {
        setAlerts(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching ops alerts:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch ops alerts",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpsAlerts();
    const interval = setInterval(fetchOpsAlerts, 60000);
    return () => clearInterval(interval);
  }, [timeRange, restaurantId, thresholdMinutes]);

  return { alerts, loading, error, refetch: fetchOpsAlerts };
}
