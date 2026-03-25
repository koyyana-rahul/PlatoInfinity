import { useState } from "react";
import toast from "react-hot-toast";
import { Power, LayoutPanelTop, Loader2, X, AlertTriangle } from "lucide-react";
import Axios from "../../../api/axios";
import kitchenStationApi from "../../../api/kitchenStation.api";
import clsx from "clsx";

export default function KitchenStationList({ stations, onUpdate }) {
  const [processingId, setProcessingId] = useState(null);
  const [confirmStation, setConfirmStation] = useState(null);

  if (!stations.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 font-medium">No stations available.</p>
      </div>
    );
  }

  const toggleStation = async (station) => {
    if (processingId) return;

    try {
      setProcessingId(station._id);
      const isEnabling = station.isArchived;
      const endpoint = isEnabling
        ? kitchenStationApi.enable
        : kitchenStationApi.disable;

      await Axios(endpoint(station._id));

      toast.success(`Station ${isEnabling ? "online" : "offline"}`);
      onUpdate(station._id, { isArchived: !isEnabling });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setProcessingId(null);
      setConfirmStation(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {stations.map((s) => {
        const isProcessing = processingId === s._id;
        const isOffline = s.isArchived;

        return (
          <div
            key={s._id}
            className={clsx(
              "p-5 rounded-xl border bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
              isOffline ? "border-gray-200" : "border-orange-200",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <LayoutPanelTop size={20} />
              </div>
              <span
                className={clsx(
                  "px-2 py-1 rounded-full text-[10px] font-semibold uppercase border",
                  isOffline
                    ? "bg-gray-50 text-gray-600 border-gray-200"
                    : "bg-green-50 text-green-700 border-green-200",
                )}
              >
                {isOffline ? "Offline" : "Online"}
              </span>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 leading-none truncate">
              {s.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">Kitchen Station</p>

            <button
              onClick={() => setConfirmStation(s)}
              disabled={isProcessing}
              className={clsx(
                "mt-5 w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
                isOffline
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
              )}
            >
              {isProcessing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Power size={14} />
              )}
              {isOffline ? "Go Online" : "Go Offline"}
            </button>
          </div>
        );
      })}

      {confirmStation && (
        <ConfirmToggleModal
          station={confirmStation}
          loading={processingId === confirmStation._id}
          onClose={() => setConfirmStation(null)}
          onConfirm={() => toggleStation(confirmStation)}
        />
      )}
    </div>
  );
}

function ConfirmToggleModal({ station, loading, onClose, onConfirm }) {
  const isOffline = station?.isArchived;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div
            className={clsx(
              "w-12 h-12 rounded-lg border flex items-center justify-center",
              isOffline
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-red-50 text-red-600 border-red-200",
            )}
          >
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isOffline ? "Go Online?" : "Go Offline?"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isOffline
                ? `Enable ${station.name} to start receiving orders.`
                : `Disable ${station.name}. New orders won't route here.`}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase">Station</span>
            <span className="text-sm font-semibold text-gray-900">
              {station.name}
            </span>
          </div>

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "flex-1 h-10 text-white rounded-lg text-sm font-semibold disabled:opacity-60",
                isOffline
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-red-600 hover:bg-red-700",
              )}
            >
              {loading
                ? "Please wait..."
                : isOffline
                  ? "Go Online"
                  : "Go Offline"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
