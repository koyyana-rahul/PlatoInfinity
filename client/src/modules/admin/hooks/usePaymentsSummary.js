import { useEffect, useState } from "react";
import dashboardService from "../../../api/dashboard.service.js";

export function usePaymentsSummary(timeRange = "today", restaurantId = null) {
  const [summary, setSummary] = useState({
    summary: {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      refundedAmount: 0,
      totalBills: 0,
      paidBills: 0,
      openBills: 0,
      refundedBills: 0,
    },
    byMethod: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentsSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getPaymentsSummary(
        timeRange,
        restaurantId,
      );
      if (response?.data) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error("❌ Error fetching payments summary:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch payments summary",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsSummary();
    const interval = setInterval(fetchPaymentsSummary, 60000);
    return () => clearInterval(interval);
  }, [timeRange, restaurantId]);

  return { summary, loading, error, refetch: fetchPaymentsSummary };
}
