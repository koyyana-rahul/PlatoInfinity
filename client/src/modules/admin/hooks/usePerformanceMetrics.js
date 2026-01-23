import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * usePerformanceMetrics Hook
 * Fetches top staff performers
 * Returns: { topStaff, loading, error, refetch }
 */
export function usePerformanceMetrics(restaurantId = null) {
  const [topStaff, setTopStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await dashboardService.getPerformanceMetrics(restaurantId);
      if (response?.data && Array.isArray(response.data)) {
        setTopStaff(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching performance metrics:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch performance metrics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceMetrics();

    // Poll every 60 seconds
    const interval = setInterval(fetchPerformanceMetrics, 60000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  return { topStaff, loading, error, refetch: fetchPerformanceMetrics };
}
