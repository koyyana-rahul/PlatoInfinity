// src/modules/staff/StaffShiftPanel.jsx
import toast from "react-hot-toast";
import Axios from "../../api/axios";
import staffApi from "../../api/staff.api";
import { FiClock, FiLogIn, FiLogOut } from "react-icons/fi";

export default function StaffShiftPanel({ user, refreshProfile }) {
  const onDuty = user.onDuty;

  const startShift = async () => {
    try {
      await Axios(staffApi.startShift);
      toast.success("Shift started");
      refreshProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to start shift");
    }
  };

  const endShift = async () => {
    try {
      await Axios(staffApi.endShift);
      toast.success("Shift ended");
      refreshProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to end shift");
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-gray-700">
        <FiClock />
        <span className="font-medium">
          Shift Status:{" "}
          <span className={onDuty ? "text-emerald-600" : "text-gray-400"}>
            {onDuty ? "ON DUTY" : "OFF DUTY"}
          </span>
        </span>
      </div>

      {onDuty ? (
        <button
          onClick={endShift}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <FiLogOut /> End Shift
        </button>
      ) : (
        <button
          onClick={startShift}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <FiLogIn /> Start Shift
        </button>
      )}
    </div>
  );
}
