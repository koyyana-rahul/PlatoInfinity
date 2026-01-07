import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";

import Axios from "../../../api/axios";
import kitchenStationApi from "../../../api/kitchenStation.api";

import KitchenStationList from "./KitchenStationList";
import CreateKitchenStationModal from "./CreateKitchenStationModal";

export default function KitchenStationsPage() {
  const { restaurantId } = useParams();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  /* ================= LOAD ================= */
  const loadStations = async () => {
    try {
      setLoading(true);
      const res = await Axios(kitchenStationApi.list(restaurantId));
      setStations(res.data?.data || []);
    } catch {
      toast.error("Unable to load kitchen stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, [restaurantId]);

  /* ================= LOCAL UPDATES ================= */
  const updateStation = (id, updates) => {
    setStations((prev) =>
      prev.map((s) => (s._id === id ? { ...s, ...updates } : s))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Kitchen Stations
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Manage preparation areas for your kitchen
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          <FiPlus /> Add Station
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      ) : (
        <KitchenStationList stations={stations} onUpdate={updateStation} />
      )}

      {openCreate && (
        <CreateKitchenStationModal
          restaurantId={restaurantId}
          onClose={() => setOpenCreate(false)}
          onSuccess={(station) => {
            setStations((p) => [...p, station]);
            setOpenCreate(false);
          }}
        />
      )}
    </div>
  );
}
