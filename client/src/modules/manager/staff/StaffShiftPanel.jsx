import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import shiftApi from "../../../api/shift.api";
import { FiClock, FiLogIn, FiLogOut, FiActivity } from "react-icons/fi";

export default function StaffShiftPanel({ user, refreshProfile }) {
  const [loading, setLoading] = useState(false);
  const onDuty = user?.onDuty;

  const handleShiftToggle = async (type) => {
    if (loading) return;
    const isStart = type === "start";

    try {
      setLoading(true);
      await Axios(isStart ? shiftApi.start : shiftApi.end);
      toast.success(isStart ? "Shift started" : "Shift ended");
      refreshProfile?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (isStart ? "Unable to start shift" : "Unable to end shift");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 max-w-md mx-auto">
      <div className="flex flex-col items-center text-center mb-6">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
            onDuty
              ? "bg-green-50 text-green-600"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          {onDuty ? <FiActivity size={26} /> : <FiClock size={26} />}
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          {onDuty ? "Shift Active" : "Shift Inactive"}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {onDuty
            ? "You are currently on duty."
            : "Start your shift to begin operations."}
        </p>
      </div>

      {onDuty ? (
        <button
          onClick={() => handleShiftToggle("end")}
          disabled={loading}
          className="w-full h-11 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <FiLogOut size={16} /> {loading ? "Ending..." : "End Shift"}
        </button>
      ) : (
        <button
          onClick={() => handleShiftToggle("start")}
          disabled={loading}
          className="w-full h-11 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <FiLogIn size={16} /> {loading ? "Starting..." : "Start Shift"}
        </button>
      )}
    </div>
  );
}
