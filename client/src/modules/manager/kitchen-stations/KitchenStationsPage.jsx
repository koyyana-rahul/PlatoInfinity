import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiSearch } from "react-icons/fi";

import Axios from "../../../api/axios";
import kitchenStationApi from "../../../api/kitchenStation.api";

import KitchenStationList from "./KitchenStationList";
import CreateKitchenStationModal from "./CreateKitchenStationModal";

export default function KitchenStationsPage() {
  const { restaurantId } = useParams();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= LOAD DATA ================= */
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

  /* ================= FILTERED DATA ================= */
  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const updateStation = (id, updates) => {
    setStations((prev) =>
      prev.map((s) => (s._id === id ? { ...s, ...updates } : s)),
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Kitchen Stations
            </h1>
            <p className="text-gray-600 text-sm">Manage cooking stations</p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            <FiPlus size={18} />
            Add Station
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Stations List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredStations.length === 0 && searchQuery ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 font-medium">No stations found</p>
          </div>
        ) : (
          <div>
            <KitchenStationList
              stations={filteredStations}
              onUpdate={updateStation}
            />
          </div>
        )}

        {/* Create Modal */}
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
    </div>
  );
}
