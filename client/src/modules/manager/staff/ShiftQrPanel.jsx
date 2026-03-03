import { useEffect, useState, useMemo } from "react";
import Axios from "../../../api/axios";
import shiftApi from "../../../api/shift.api";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import {
  FiCopy,
  FiRefreshCw,
  FiPower,
  FiClock,
  FiShield,
} from "react-icons/fi";
import ShiftActionModal from "./ShiftActionModal";

export default function ShiftQrPanel() {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [actionModal, setActionModal] = useState(null);

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

  useEffect(() => {
    if (!shift?.qrExpiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [shift?.qrExpiresAt]);

  const openShift = async () => {
    try {
      setLoading(true);
      const res = await Axios({ ...shiftApi.open, data: { openedCash: 0 } });
      setShift(res.data.data);
      toast.success("Shift started");
    } catch {
      toast.error("Shift start failed");
    } finally {
      setLoading(false);
      setActionModal(null);
    }
  };

  const refreshQr = async () => {
    try {
      setLoading(true);
      const res = await Axios(shiftApi.refreshQr);
      setShift(res.data.data);
      toast.success("QR refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setLoading(false);
      setActionModal(null);
    }
  };

  const closeShift = async () => {
    try {
      setLoading(true);
      await Axios(shiftApi.close);
      setShift(null);
      toast.success("Shift closed");
    } catch {
      toast.error("Close shift failed");
    } finally {
      setLoading(false);
      setActionModal(null);
    }
  };

  const qrValue = useMemo(() => {
    if (!shift?.qrToken) return "";
    return `${window.location.origin}/staff/login?token=${shift.qrToken}`;
  }, [shift?.qrToken]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const expiresMs = shift ? new Date(shift.qrExpiresAt).getTime() - now : 0;
  const expiresInMin = Math.max(0, Math.floor(expiresMs / 60000));
  const expiresInSec = Math.max(0, Math.floor((expiresMs % 60000) / 1000));
  const isExpiringSoon = expiresInMin < 2;

  if (!shift) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-orange-600">
              <FiShield size={30} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Staff QR Access
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Start shift to generate secure login QR for staff.
            </p>

            <button
              onClick={() => setActionModal("start")}
              disabled={loading}
              className="mt-6 w-full py-3 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Shift"}
            </button>
          </div>
        </div>

        <ShiftActionModal
          open={actionModal === "start"}
          title="Start Shift"
          description="This will activate staff QR login for the current shift."
          confirmLabel="Start Now"
          loading={loading}
          tone="orange"
          onClose={() => setActionModal(null)}
          onConfirm={openShift}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8 w-full max-w-[520px] mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Staff QR Access
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Share this QR for staff login
              </p>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                isExpiringSoon
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              <FiClock
                size={12}
                className={isExpiringSoon ? "animate-pulse" : ""}
              />
              <span className="text-xs font-semibold tabular-nums">
                {expiresInMin}:{expiresInSec.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex justify-center bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <QRCode
              value={qrValue}
              size={160}
              level="H"
              className="rounded-lg w-full max-w-[220px] h-auto"
              fgColor="#111827"
            />
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Login Link
              </label>
              <button
                onClick={copyLink}
                className="text-xs font-semibold text-orange-600 uppercase flex items-center gap-1 hover:underline"
              >
                <FiCopy size={10} /> Copy Link
              </button>
            </div>

            <div className="h-11 bg-gray-50 border border-gray-200 rounded-lg px-4 flex items-center overflow-hidden">
              <span className="text-xs font-medium text-gray-500 truncate">
                {qrValue}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setActionModal("refresh")}
              className="h-11 flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold uppercase hover:bg-gray-50"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={() => setActionModal("close")}
              className="h-11 flex items-center justify-center gap-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold uppercase hover:bg-red-100"
            >
              <FiPower size={14} /> Close Shift
            </button>
          </div>
        </div>
      </div>

      <ShiftActionModal
        open={actionModal === "refresh"}
        title="Refresh QR"
        description="Generate a fresh secure QR token for staff login."
        confirmLabel="Refresh QR"
        loading={loading}
        tone="orange"
        onClose={() => setActionModal(null)}
        onConfirm={refreshQr}
      />

      <ShiftActionModal
        open={actionModal === "close"}
        title="Close Shift"
        description="This will disable staff QR login for the current shift."
        confirmLabel="Close Shift"
        loading={loading}
        tone="red"
        onClose={() => setActionModal(null)}
        onConfirm={closeShift}
      />
    </div>
  );
}
