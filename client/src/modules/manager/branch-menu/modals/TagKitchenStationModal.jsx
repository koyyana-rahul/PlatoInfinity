import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import clsx from "clsx";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";
import kitchenStationApi from "../../../../api/kitchenStation.api";

export default function TagKitchenStationModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const [stations, setStations] = useState([]);
  const initialStationId =
    typeof item.kitchenStationId === "string"
      ? item.kitchenStationId
      : item.kitchenStationId?._id || null;
  const [selectedStationId, setSelectedStationId] = useState(initialStationId);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);

  // Load kitchen stations
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoadingStations(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch {
        toast.error("Failed to load kitchen stations");
      } finally {
        setLoadingStations(false);
      }
    };

    loadStations();
  }, [restaurantId]);

  const submit = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        ...branchMenuApi.tagItemToStation(restaurantId, item._id),
        data: {
          kitchenStationId: selectedStationId,
        },
      });

      toast.success("Menu item tagged successfully");
      onSuccess?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to tag item");
    } finally {
      setLoading(false);
    }
  };

  const selectedStation = stations.find((s) => s._id === selectedStationId);

  const filteredStations = stations.filter((s) => {
    const text = `${s.name || ""} ${s.displayName || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-5 sm:p-7 space-y-4 overflow-y-auto max-h-[90vh]">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Assign to Kitchen Station
            </h3>
            <p className="text-sm text-gray-600 mt-1 truncate">{item.name}</p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-900 font-semibold">
              Step 1: Select station • Step 2: Save assignment
            </p>
          </div>

          {loadingStations ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : stations.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-800 font-semibold">
                No kitchen stations found
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Create kitchen stations first to assign items
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search station..."
                className="w-full h-10 px-3 border border-gray-300 rounded-xl text-sm"
              />

              {/* No Station Option */}
              <button
                onClick={() => setSelectedStationId(null)}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-xl border-2 transition text-sm font-medium",
                  selectedStationId === null
                    ? "bg-orange-50 border-orange-300 text-orange-900"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300",
                )}
              >
                ❌ No Station (Unassigned)
              </button>

              {/* Station Options */}
              {filteredStations.map((station) => (
                <button
                  key={station._id}
                  onClick={() => setSelectedStationId(station._id)}
                  className={clsx(
                    "w-full text-left px-4 py-3 rounded-xl border-2 transition text-sm font-medium flex items-center gap-2",
                    selectedStationId === station._id
                      ? "bg-orange-50 border-orange-300 text-orange-900"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300",
                  )}
                >
                  <span className="text-lg">{station.badge || "🍳"}</span>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {station.displayName || station.name}
                    </div>
                    {station.displayName && (
                      <div className="text-xs opacity-70">{station.name}</div>
                    )}
                  </div>
                  {!station.isArchived && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Online
                    </span>
                  )}
                </button>
              ))}

              {!filteredStations.length && (
                <div className="text-center text-xs text-gray-500 py-3 border border-dashed border-gray-300 rounded-lg">
                  No station matches your search
                </div>
              )}
            </div>
          )}

          {/* Current Selection Info */}
          {selectedStation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900 font-medium">
                ✓ Item will be routed to{" "}
                {selectedStation.displayName || selectedStation.name}
              </p>
            </div>
          )}

          {selectedStationId === null && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="text-gray-700">
                Item will not be assigned to any kitchen station
              </p>
            </div>
          )}

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || loadingStations}
              className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Saving..." : "Save Assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
