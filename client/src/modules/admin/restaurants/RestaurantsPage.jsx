import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiHome, FiSearch, FiLayers } from "react-icons/fi";

import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";

import RestaurantCard from "./RestaurantCard";
import CreateRestaurantModal from "./CreateRestaurantModal";

export default function RestaurantsPage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await Axios(restaurantApi.list);
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* ================= HEADER: Executive Style ================= */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Units
          </h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Brand Infrastructure Management
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200/50 transition-all active:scale-95"
        >
          <FiPlus size={18} strokeWidth={3} />
          Add Restaurant
        </button>
      </div>

      {/* ================= SEARCH & UTILITIES ================= */}
      <div className="relative max-w-md group">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
        />
      </div>

      {/* ================= CONTENT AREA ================= */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <RestaurantCard key={i} data={null} />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <EmptyState
          onCreate={() => setOpenCreate(true)}
          hasQuery={searchQuery.length > 0}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((r) => (
            <RestaurantCard
              key={r._id}
              data={r}
              onManageManagers={() =>
                navigate(`/${brandSlug}/admin/restaurants/${r._id}/managers`)
              }
            />
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {openCreate && (
        <CreateRestaurantModal
          onClose={() => setOpenCreate(false)}
          onSuccess={fetchRestaurants}
        />
      )}
    </div>
  );
}

/* ================= UI PARTS ================= */

function EmptyState({ onCreate, hasQuery }) {
  return (
    <div className="bg-white rounded-[40px] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-16 text-center max-w-xl mx-auto space-y-6">
      <div className="h-20 w-20 rounded-[24px] bg-slate-50 text-slate-300 flex items-center justify-center mx-auto transition-transform hover:rotate-12">
        {hasQuery ? <FiSearch size={32} /> : <FiLayers size={32} />}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {hasQuery ? "No matches found" : "Deployment Required"}
        </h3>
        <p className="text-sm font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">
          {hasQuery
            ? "We couldn't find any units matching your current search criteria."
            : "There are currently no active restaurant units associated with this brand."}
        </p>
      </div>

      {!hasQuery && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          <FiPlus size={16} strokeWidth={3} />
          Initialize First Unit
        </button>
      )}
    </div>
  );
}
