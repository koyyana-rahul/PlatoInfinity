import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * Custom hook to fetch and manage dashboard statistics
 * Handles API calls, caching, and auto-refresh every 30 seconds
 */
export const useDashboardStats = (timeRange) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersToday: 0,
    activeTables: 0,
    activeUsers: 0,
    averageOrderValue: 0,
    completionRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getDashboardSummary();

      if (response?.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching stats:", err.message);
      console.error("   Response data:", err.response?.data);
      setError(
        err?.response?.data?.message || err.message || "Failed to fetch stats",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  return { stats, loading, error, setStats, refetch: fetchStats };
};
