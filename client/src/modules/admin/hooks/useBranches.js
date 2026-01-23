import { useState, useEffect } from "react";
import dashboardService from "../../../api/dashboard.service.js";

/**
 * Custom hook to fetch and manage branches
 * Handles API calls for getting all branches/restaurants
 */
export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await dashboardService.getBranches();

        if (response?.data && Array.isArray(response.data)) {
          setBranches(response.data);
        } else if (response?.data) {
          // Handle case where data is directly an array
          setBranches(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("❌ Error fetching branches:", err.message);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to fetch branches",
        );
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, loading, error };
};
