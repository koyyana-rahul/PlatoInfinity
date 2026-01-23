import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * useRevenueBreakdown Hook
 * Fetches revenue breakdown by category
 * Returns: { breakdown, loading, error, refetch }
 */
export function useRevenueBreakdown(timeRange = "today", restaurantId = null) {
  const [breakdown, setBreakdown] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getRevenueBreakdown(
        timeRange,
        restaurantId,
      );
      if (response?.data && Array.isArray(response.data)) {
        setBreakdown(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching revenue breakdown:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch revenue breakdown",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueBreakdown();

    // Poll every 60 seconds
    const interval = setInterval(fetchRevenueBreakdown, 60000);

    return () => clearInterval(interval);
  }, [timeRange, restaurantId]);

  return { breakdown, loading, error, refetch: fetchRevenueBreakdown };
}
