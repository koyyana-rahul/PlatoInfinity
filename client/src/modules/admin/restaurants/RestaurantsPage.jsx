import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiLayers,
  FiRefreshCw,
  FiChevronRight,
  FiMapPin,
  FiPhone,
  FiSettings,
  FiTrash2,
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
  const [filterBy, setFilterBy] = useState("all");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              🏪 Restaurant Units
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Manage all locations and branches across your brand
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchRestaurants}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
              title="Refresh restaurants list"
            >
              <FiRefreshCw
                size={16}
                className="sm:w-5 sm:h-5"
                strokeWidth={2.5}
              />
              <span className="hidden sm:inline text-xs sm:text-sm font-bold text-slate-700">
                Refresh
              </span>
            </button>
            <button
              onClick={() => setOpenCreate(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all shadow-lg hover:shadow-xl"
            >
              <FiPlus size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Restaurant</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* ================= SEARCH BAR ================= */}
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
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-slate-200 rounded-lg sm:rounded-xl bg-white shadow-sm group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 group-focus-within:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-5 animate-pulse space-y-3"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center border border-slate-200 max-w-md mx-auto shadow-sm">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 text-slate-300 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
        {hasQuery ? <FiSearch size={32} /> : <FiLayers size={32} />}
      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">
        {hasQuery ? "No restaurants found" : "No restaurants yet"}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 font-medium mb-6">
        {hasQuery
          ? "Try adjusting your search criteria"
          : "Create your first restaurant location to get started"}
      </p>

      {!hasQuery && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg"
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
    slate: "bg-slate-50 border-slate-200 text-slate-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
  };

  return (
    <div
      className={`rounded-lg sm:rounded-xl border p-4 sm:p-5 shadow-sm ${colorClasses[color]}`}
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
