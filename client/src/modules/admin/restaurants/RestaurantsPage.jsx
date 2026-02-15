import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiLayers,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import RestaurantCard from "./RestaurantCard";
import CreateRestaurantModal from "./CreateRestaurantModal";
import RestaurantDetailsModal from "./RestaurantDetailsModal";

/**
 * Restaurants Page - Complete Restaurant Management System
 */
export default function RestaurantsPage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await Axios(restaurantApi.list);
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone?.includes(searchQuery) ||
      r.addressText?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleDeleteRestaurant = async (restaurantId) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      const toastId = toast.loading("Deleting restaurant...");
      try {
        await Axios.delete(`/api/restaurants/${restaurantId}`);
        toast.success("Restaurant deleted successfully", { id: toastId });
        fetchRestaurants();
      } catch (err) {
        toast.error("Failed to delete restaurant", { id: toastId });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-500">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Restaurant Units
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
              View, search, and manage all restaurant locations from one clean
              dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRestaurants}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]"
              title="Refresh restaurants list"
            >
              <FiRefreshCw
                size={16}
                className="sm:w-5 sm:h-5"
                strokeWidth={2.5}
              />
              <span className="hidden sm:inline text-sm font-bold text-slate-700">
                Refresh
              </span>
            </button>

            <button
              onClick={() => setOpenCreate(true)}
              className="flex items-center gap-2 bg-[#F35C2B] hover:brightness-95 active:scale-95 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-sm transition-all shadow-[0_20px_25px_-5px_rgb(243_92_43_/_0.35)]"
            >
              <FiPlus size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Restaurant</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]">
          <div className="relative group">
          <FiSearch
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none sm:w-5 sm:h-5"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-2xl bg-slate-50 group-focus-within:ring-4 group-focus-within:ring-[#F35C2B]/10 focus:outline-none transition-all"
          />
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <StatCard
            label="Total Units"
            value={restaurants.length}
            color="slate"
            icon="🏢"
          />
          <StatCard
            label="Active Units"
            value={restaurants.filter((r) => !r.isArchived).length}
            color="emerald"
            icon="🟢"
          />
          <StatCard
            label="Filtered Results"
            value={filteredRestaurants.length}
            color="blue"
            icon="🔍"
          />
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 animate-pulse space-y-3 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]"
              >
                <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                <div className="h-4 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-28 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            onCreate={() => setOpenCreate(true)}
            hasQuery={searchQuery.length > 0}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                data={restaurant}
                onView={() => setSelectedRestaurant(restaurant)}
                onManageManagers={() =>
                  navigate(
                    `/${brandSlug}/admin/restaurants/${restaurant._id}/managers`,
                  )
                }
                onDelete={() => handleDeleteRestaurant(restaurant._id)}
              />
            ))}
          </div>
        )}

        {/* ================= MODALS ================= */}
        {openCreate && (
          <CreateRestaurantModal
            onClose={() => setOpenCreate(false)}
            onSuccess={fetchRestaurants}
          />
        )}

        {selectedRestaurant && (
          <RestaurantDetailsModal
            restaurant={selectedRestaurant}
            brandSlug={brandSlug}
            onClose={() => setSelectedRestaurant(null)}
            onSuccess={fetchRestaurants}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onCreate, hasQuery }) {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 text-center max-w-md mx-auto shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.03)]">
        {hasQuery ? <FiSearch size={32} /> : <FiLayers size={32} />}
      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 mb-2">
        {hasQuery ? "No restaurants found" : "No restaurants yet"}
      </h3>
      <p className="text-sm text-slate-500 font-medium mb-6">
        {hasQuery
          ? "Try adjusting your search criteria"
          : "Create your first restaurant location to get started"}
      </p>

      {!hasQuery && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-[#F35C2B] hover:brightness-95 active:scale-95 text-white px-5 sm:px-6 py-3 rounded-full font-bold text-sm transition-all shadow-[0_20px_25px_-5px_rgb(243_92_43_/_0.35)]"
        >
          <FiPlus size={16} className="sm:w-5 sm:h-5" />
          Add First Restaurant
        </button>
      )}
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, color = "slate", icon }) {
  const colorClasses = {
    slate: "bg-white text-slate-900",
    emerald: "bg-white text-emerald-900",
    blue: "bg-white text-blue-900",
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)] ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-tight mb-1">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-black">{value}</p>
        </div>
        <div className="text-3xl sm:text-4xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
