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
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 py-3 sm:py-8 space-y-3 sm:space-y-6 transition-all">
        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
          <div>
            <h1 className="text-xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-1 xs:mb-2">
              Kitchen Stations
            </h1>
            <p className="text-xs xs:text-sm text-gray-600">
              Manage cooking stations
            </p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-1 px-2 xs:gap-2 xs:px-4 py-2 xs:py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full font-bold shadow-sm hover:from-orange-600 hover:to-orange-500 transition-all duration-200 hover:-translate-y-0.5 text-xs xs:text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <span className="flex items-center justify-center bg-white bg-opacity-20 rounded-full p-1 mr-1 xs:mr-2">
              <FiPlus size={18} />
            </span>
            <span className="ml-1 text-center text-[10px] xs:text-[10px] sm:text-xs leading-tight font-medium">
              Add Station
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch
            className="absolute left-2.5 top-2.5 text-gray-400"
            size={14}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations..."
            className="w-full pl-9 pr-3 py-1.5 xs:py-2 border border-gray-300 rounded-lg text-xs xs:text-sm"
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
