// src/modules/staff/hooks/useStaffShift.js
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";

export function useStaffShift() {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // GET CURRENT SHIFT STATUS
  const getShiftStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios(staffApi.getShiftStatus);
      if (res.data.success) {
        setShift(res.data.data);
      }
    } catch (err) {
      console.error("Failed to get shift status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // START SHIFT (CLOCK IN)
  const startShift = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios(staffApi.startShift);

      if (res.data.success) {
        setShift(res.data.data);
        toast.success("Shift started!");
        return res.data.data;
      }
    } catch (err) {
      console.error("Failed to start shift:", err);
      toast.error(err.response?.data?.message || "Failed to start shift");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // END SHIFT (CLOCK OUT)
  const endShift = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios(staffApi.endShift);

      if (res.data.success) {
        setShift(null);
        toast.success("Shift ended!");
        // Redirect to login
        setTimeout(() => navigate("/staff/login"), 1000);
        return res.data;
      }
    } catch (err) {
      console.error("Failed to end shift:", err);
      toast.error(err.response?.data?.message || "Failed to end shift");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // LOAD SHIFT ON MOUNT
  useEffect(() => {
    getShiftStatus();
  }, [getShiftStatus]);

  return {
    shift,
    loading,
    startShift,
    endShift,
    getShiftStatus,
  };
}
