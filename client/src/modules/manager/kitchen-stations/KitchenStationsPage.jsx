import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, ChefHat, Search, Inbox, RefreshCw } from "lucide-react";

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
    <div className="relative min-h-screen bg-[#F8FAF9] pb-10 overflow-x-hidden">
      {/* ADAPTIVE BACKGROUND DECORATION */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-emerald-500/[0.02] blur-[80px] sm:blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 space-y-5 sm:space-y-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* HEADER SECTION - Compacted for Mobile Viewports */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-8">
          <div className="space-y-1 sm:space-y-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white shadow-sm border border-slate-100 text-emerald-600 rounded-xl sm:rounded-[22px] flex items-center justify-center">
                <ChefHat
                  size={20}
                  className="sm:w-7 sm:h-7"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Stations
                </h1>
                <p className="hidden sm:block text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">
                  Workflow Optimization
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 sm:gap-4 w-full lg:w-auto">
            {/* SEARCH BAR - Fluid Width */}
            <div className="relative flex-1 sm:w-64 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 sm:h-14 bg-white border border-slate-100 rounded-xl sm:rounded-2xl pl-9 pr-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
              />
            </div>

            {/* ADD BUTTON - High Touch Target */}
            <button
              onClick={() => setOpenCreate(true)}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 sm:px-8 h-11 sm:h-14 rounded-xl sm:rounded-[22px] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 active:scale-95 transition-all duration-500"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden xs:inline">Add Station</span>
            </button>
          </div>
        </div>

        {/* LOADING & CONTENT AREA */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 sm:h-52 bg-white border border-slate-100 rounded-2xl sm:rounded-[32px] animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-50/40 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            ))}
          </div>
        ) : filteredStations.length === 0 && searchQuery ? (
          /* NO RESULTS FEEDBACK */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-white border border-slate-100 text-slate-200 rounded-[24px] flex items-center justify-center mb-4 shadow-sm">
              <Inbox size={32} strokeWidth={1} />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
              No Match Found
            </p>
            <p className="text-xs font-medium text-slate-400 mt-1 max-w-[180px]">
              We couldn't find any station named "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            <KitchenStationList
              stations={filteredStations}
              onUpdate={updateStation}
            />
          </div>
        )}

        {/* REFRESH STATUS (Mobile Tip) */}
        {!loading && (
          <div className="flex justify-center md:hidden">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={10} /> Up to date
            </p>
          </div>
        )}

        {/* CREATE MODAL */}
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
}
