import { useEffect, useState, useMemo } from "react";
import Axios from "../../../api/axios";
import shiftApi from "../../../api/shift.api";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import clsx from "clsx";
import { FiCopy } from "react-icons/fi";

export default function ShiftQrPanel() {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  /* ===============================
     LOAD ACTIVE SHIFT
  =============================== */
  const loadActiveShift = async () => {
    try {
      const res = await Axios(shiftApi.active);
      setShift(res.data?.data || null);
    } catch {
      setShift(null);
    }
  };

  useEffect(() => {
    loadActiveShift();
  }, []);

  /* ===============================
     LIVE TIMER (QR EXPIRY)
  =============================== */
  useEffect(() => {
    if (!shift?.qrExpiresAt) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [shift?.qrExpiresAt]);

  /* ===============================
     OPEN SHIFT
  =============================== */
  const openShift = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        ...shiftApi.open,
        data: { openedCash: 0 },
      });
      setShift(res.data.data);
      toast.success("Shift opened & QR generated");
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("Shift already open");
        loadActiveShift();
      } else {
        toast.error("Failed to open shift");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     REFRESH QR
  =============================== */
  const refreshQr = async () => {
    try {
      const res = await Axios(shiftApi.refreshQr);
      setShift(res.data.data);
      toast.success("QR refreshed");
    } catch {
      toast.error("Unable to refresh QR");
    }
  };

  /* ===============================
     CLOSE SHIFT
  =============================== */
  const closeShift = async () => {
    try {
      await Axios(shiftApi.close);
      setShift(null);
      toast.success("Shift closed");
    } catch {
      toast.error("Failed to close shift");
    }
  };

  /* ===============================
     QR LOGIN LINK
  =============================== */
  const qrValue = useMemo(() => {
    if (!shift?.qrToken) return "";
    return `${window.location.origin}/staff/login?token=${shift.qrToken}`;
  }, [shift?.qrToken]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      toast.success("Login link copied");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  /* ===============================
     NO ACTIVE SHIFT UI
  =============================== */
  if (!shift) {
    return (
      <div className="bg-white rounded-2xl shadow-md border p-6 max-w-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Shift Status
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          No active shift. Open a shift to allow staff login.
        </p>

        <button
          onClick={openShift}
          disabled={loading}
          className={clsx(
            "w-full py-3 rounded-xl text-white font-medium transition",
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          {loading ? "Opening shift..." : "Open Shift & Generate QR"}
        </button>
      </div>
    );
  }

  /* ===============================
     EXPIRY CALCULATION
  =============================== */
  const expiresMs = new Date(shift.qrExpiresAt).getTime() - now;

  const expiresInMin = Math.max(0, Math.floor(expiresMs / 60000));
  const expiresInSec = Math.max(0, Math.floor(expiresMs / 1000));

  const isExpiringSoon = expiresInMin <= 3;

  return (
    <div className="bg-white rounded-2xl shadow-md border p-6 w-full max-w-md">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Staff Login QR
          </h3>
          <p className="text-xs text-gray-500">Active shift is running</p>
        </div>

        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium",
            isExpiringSoon
              ? "bg-red-100 text-red-600"
              : "bg-emerald-100 text-emerald-700"
          )}
        >
          {isExpiringSoon
            ? `Expiring in ${expiresInSec}s`
            : `Expires in ${expiresInMin} min`}
        </span>
      </div>

      {/* ---------- QR ---------- */}
      <div className="flex justify-center bg-gray-50 rounded-xl p-4 border">
        <QRCode value={qrValue} size={220} />
      </div>

      {/* ---------- LOGIN LINK ---------- */}
      <div className="mt-4">
        <label className="text-xs font-semibold text-gray-600">
          Staff Login Link
        </label>

        <div className="mt-1 flex gap-2">
          <input
            readOnly
            value={qrValue}
            className="flex-1 text-xs px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
          />

          <button
            onClick={copyLink}
            className="px-3 rounded-lg border text-gray-700 hover:bg-gray-100"
            title="Copy link"
          >
            <FiCopy />
          </button>
        </div>
      </div>

      {/* ---------- INFO ---------- */}
      <p className="text-xs text-gray-500 text-center mt-3">
        Staff must scan the QR or use this link inside the restaurant
      </p>

      {/* ---------- ACTIONS ---------- */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={refreshQr}
          className="py-2 rounded-lg border border-gray-300
                     text-gray-700 text-sm font-medium
                     hover:bg-gray-100 transition"
        >
          Refresh QR
        </button>

        <button
          onClick={closeShift}
          className="py-2 rounded-lg bg-red-600
                     text-white text-sm font-medium
                     hover:bg-red-700 transition"
        >
          Close Shift
        </button>
      </div>
    </div>
  );
}
