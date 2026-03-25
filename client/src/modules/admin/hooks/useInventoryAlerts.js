import { useEffect, useState } from "react";
import dashboardService from "../../../api/dashboard.service.js";

export function useInventoryAlerts(threshold = 10, restaurantId = null) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventoryAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getInventoryAlerts(
        threshold,
        restaurantId,
      );
      if (response?.data) {
        setAlerts(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching inventory alerts:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch inventory alerts",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAlerts();
    const interval = setInterval(fetchInventoryAlerts, 60000);
    return () => clearInterval(interval);
  }, [threshold, restaurantId]);

  return { alerts, loading, error, refetch: fetchInventoryAlerts };
}
