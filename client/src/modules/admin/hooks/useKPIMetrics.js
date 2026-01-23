import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * useKPIMetrics Hook
 * Fetches KPI metrics from backend
 * Returns: { metrics, loading, error, refetch }
 */
export function useKPIMetrics(timeRange = "today", restaurantId = null) {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    revenueTrend: 0,
    ordersToday: 0,
    ordersTrend: 0,
    averageOrderValue: 0,
    avgTrend: 0,
    completionRate: 0,
    completionTrend: 0,
    activeTables: 0,
    activeUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getKPIMetrics(
        timeRange,
        restaurantId,
      );
      if (response?.data) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching KPI metrics:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch KPI metrics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIMetrics();

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchKPIMetrics, 30000);

    return () => clearInterval(interval);
  }, [timeRange, restaurantId]);

  return { metrics, loading, error, refetch: fetchKPIMetrics };
}
