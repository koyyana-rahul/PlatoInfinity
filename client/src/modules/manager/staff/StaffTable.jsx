import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";

import RegeneratePinModal from "./RegeneratePinModal";
import RemoveStaffModal from "./RemoveStaffModal";

import {
  FiUser,
  FiCoffee,
  FiDollarSign,
  FiKey,
  FiPower,
  FiClock,
  FiAlertTriangle,
  FiPhone,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

/* ================= ROLE ICON MAP ================= */
const ROLE_ICON = {
  WAITER: FiUser,
  CHEF: FiCoffee,
  CASHIER: FiDollarSign,
};

/* ================= TIME FORMAT ================= */
const formatTime = (v) =>
  v
    ? new Date(v).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

export default function StaffTable({
  staff = [],
  restaurantId,
  onUpdateStaff,
  onToggleStaff,
}) {
  const [pinTarget, setPinTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  // 👁 PIN VISIBILITY MAP
  const [showPinMap, setShowPinMap] = useState({});

  const toggleShowPin = (staffId) => {
    setShowPinMap((prev) => ({
      ...prev,
      [staffId]: !prev[staffId],
    }));
  };

  /* ================= REGENERATE PIN ================= */
  const regeneratePin = async () => {
    try {
      setLoading(true);

      const res = await Axios(
        staffApi.regeneratePin(restaurantId, pinTarget._id)
      );

      const newPin = res.data?.data?.staffPin;
      if (!newPin) {
        toast.error("PIN generation failed");
        return;
      }

      toast.success("New PIN generated");

      onUpdateStaff(pinTarget._id, {
        staffPin: newPin,
      });

      // auto-show newly generated PIN
      setShowPinMap((prev) => ({
        ...prev,
        [pinTarget._id]: true,
      }));

      setPinTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to regenerate PIN");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleActive = async () => {
    try {
      setLoading(true);

      await Axios(staffApi.toggleActive(restaurantId, toggleTarget._id));

      toast.success(
        toggleTarget.isActive ? "Staff deactivated" : "Staff activated"
      );

      onToggleStaff(toggleTarget._id);

      setToggleTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update staff");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EMPTY STATE ================= */
  if (!staff.length) {
    return (
      <div className="bg-white border rounded-xl p-8 text-center">
        <FiAlertTriangle className="mx-auto text-3xl text-gray-400 mb-3" />
        <p className="text-sm text-gray-600">No staff found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border rounded-xl divide-y">
        {staff.map((s) => {
          const Icon = ROLE_ICON[s.role] || FiUser;
          const showPin = showPinMap[s._id];

          return (
            <div
              key={s._id}
              className={`p-4 flex flex-col gap-3 ${
                !s.isActive ? "bg-gray-50 opacity-80" : ""
              }`}
            >
              {/* ================= HEADER ================= */}
              <div className="flex justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {s.name}
                  </p>

                  <p className="text-xs font-mono text-gray-700 truncate">
                    {s.staffCode}
                  </p>

                  {/* PHONE */}
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <FiPhone className="text-gray-500" />
                    {s.mobile || "—"}
                  </p>

                  {/* SHIFT */}
                  <p className="text-xs text-gray-600">
                    In:{" "}
                    <span className="font-medium text-gray-800">
                      {formatTime(s.lastShiftIn)}
                    </span>{" "}
                    · Out:{" "}
                    <span className="font-medium text-gray-800">
                      {formatTime(s.lastShiftOut)}
                    </span>
                  </p>
                </div>

                {/* ROLE */}
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700 shrink-0">
                  <Icon className="text-gray-600" />
                  {s.role}
                </div>
              </div>

              {/* ================= META ================= */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-mono text-gray-800">
                  <span>
                    PIN:{" "}
                    {s.isActive
                      ? showPin
                        ? s.staffPin || "----"
                        : "••••"
                      : "--"}
                  </span>

                  {s.isActive && s.staffPin && (
                    <button
                      onClick={() => toggleShowPin(s._id)}
                      className="text-gray-500 hover:text-gray-800"
                      title={showPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showPin ? <FiEyeOff /> : <FiEye />}
                    </button>
                  )}
                </div>

                <span
                  className={`flex items-center gap-1 font-semibold ${
                    s.onDuty ? "text-emerald-700" : "text-gray-500"
                  }`}
                >
                  <FiClock />
                  {s.onDuty ? "ON SHIFT" : "OFF SHIFT"}
                </span>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="flex gap-2 pt-2">
                <button
                  disabled={!s.isActive}
                  onClick={() => setPinTarget(s)}
                  className="
                    flex-1 text-xs py-2 rounded-lg border
                    text-gray-800 font-medium
                    hover:bg-gray-50
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  <FiKey className="inline mr-1" />
                  Regenerate PIN
                </button>

                <button
                  onClick={() => setToggleTarget(s)}
                  className={`flex-1 text-xs py-2 rounded-lg border font-medium ${
                    s.isActive
                      ? "border-red-300 text-red-700 hover:bg-red-50"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <FiPower className="inline mr-1" />
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODALS ================= */}
      {pinTarget && (
        <RegeneratePinModal
          staff={pinTarget}
          loading={loading}
          onClose={() => setPinTarget(null)}
          onConfirm={regeneratePin}
        />
      )}

      {toggleTarget && (
        <RemoveStaffModal
          staff={toggleTarget}
          loading={loading}
          onClose={() => setToggleTarget(null)}
          onConfirm={toggleActive}
        />
      )}
    </>
  );
}
