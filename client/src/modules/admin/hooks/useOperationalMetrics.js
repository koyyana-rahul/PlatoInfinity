import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * useOperationalMetrics Hook
 * Fetches operational metrics: prep time, delivery, satisfaction, waste
 * Returns: { operationalData, loading, error, refetch }
 */
export function useOperationalMetrics(
  timeRange = "today",
  restaurantId = null,
) {
  const [operationalData, setOperationalData] = useState({
    avgPreparationTime: "0 min",
    avgDeliveryTime: "0 min",
    customerSatisfaction: "0/5",
    foodWastePercentage: "0%",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOperationalMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getOperationalMetrics(
        timeRange,
        restaurantId,
      );
      if (response?.data) {
        setOperationalData(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching operational metrics:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch operational metrics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalMetrics();

    // Poll every 60 seconds
    const interval = setInterval(fetchOperationalMetrics, 60000);

    return () => clearInterval(interval);
  }, [timeRange, restaurantId]);

  return { operationalData, loading, error, refetch: fetchOperationalMetrics };
}
