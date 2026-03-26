import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiSearch, FiLayers } from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import useAutoRefresh from "../../../hooks/useAutoRefresh";
import { useSocket } from "../../../socket/SocketProvider";
import RestaurantCard from "./RestaurantCard";
import CreateRestaurantModal from "./CreateRestaurantModal";
import RestaurantDetailsModal from "./RestaurantDetailsModal";
import DeleteRestaurantModal from "./DeleteRestaurantModal";

/**
 * Restaurants Page - Complete Restaurant Management System
 */
export default function RestaurantsPage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [restaurants, setRestaurants] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch restaurants
  const fetchRestaurants = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const res = await Axios(restaurantApi.list);
      setRestaurants(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      if (!silent) toast.error("Failed to load restaurants");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const isModalOpen = openCreate || selectedRestaurant || restaurantToDelete;
  useAutoRefresh(
    () => fetchRestaurants({ silent: true }),
    15000,
    {
      enabled: !isModalOpen,
      pauseWhenHidden: true,
    },
  );

  useEffect(() => {
    if (!socket) return;

    const syncRestaurants = () => fetchRestaurants({ silent: true });
    const events = [
      "connect",
      "restaurant:created",
      "restaurant:updated",
      "restaurant:deleted",
      "manager:invited",
      "manager:removed",
    ];

    events.forEach((eventName) => socket.on(eventName, syncRestaurants));

    return () => {
      events.forEach((eventName) => socket.off(eventName, syncRestaurants));
    };
  }, [socket, fetchRestaurants]);

  // Filter restaurants
  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.phone?.includes(searchQuery) ||
          r.addressText?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      }),
    [restaurants, searchQuery],
  );

  const handleDeleteRestaurant = (restaurant) => {
    setRestaurantToDelete(restaurant);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 p-2.5 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-0">
        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">
              Restaurants
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Live list of all your restaurant locations
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setOpenCreate(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98]"
            >
              <FiPlus size={18} strokeWidth={2.5} />
              <span>Add Restaurant</span>
            </button>
          </div>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm">
          <div className="relative">
            <FiSearch
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, phone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FC8019] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatCard
            label="Total Locations"
            value={restaurants.length}
            color="orange"
            icon="🏪"
          />
          <StatCard
            label="Active"
            value={restaurants.filter((r) => !r.isArchived).length}
            color="green"
            icon="✓"
          />
          <StatCard
            label="Search Results"
            value={filteredRestaurants.length}
            color="blue"
            icon="🔍"
          />
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 sm:p-5 animate-pulse space-y-3 border border-gray-200"
              >
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 w-28 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            onCreate={() => setOpenCreate(true)}
            hasQuery={searchQuery.length > 0}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                onDelete={() => handleDeleteRestaurant(restaurant)}
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

        {restaurantToDelete && (
          <DeleteRestaurantModal
            restaurant={restaurantToDelete}
            onClose={() => setRestaurantToDelete(null)}
            onSuccess={fetchRestaurants}
          />
        )}

        {/* ================= MOBILE FAB ================= */}
        <button
          onClick={() => setOpenCreate(true)}
          className="sm:hidden fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/35 border-2 border-orange-600 active:scale-[0.98]"
        >
          <FiPlus size={18} strokeWidth={2.5} />
          Add Restaurant
        </button>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onCreate, hasQuery }) {
  return (
    <div className="bg-white rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto border border-gray-200 shadow-sm">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 border-2 border-gray-200">
        {hasQuery ? <FiSearch size={32} /> : <FiLayers size={32} />}
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {hasQuery ? "No restaurants found" : "No restaurants yet"}
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {hasQuery
          ? "Try adjusting your search criteria"
          : "Create your first restaurant location to get started"}
      </p>

      {!hasQuery && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-[0.98]"
        >
          <FiPlus size={18} strokeWidth={2.5} />
          Add First Restaurant
        </button>
      )}
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, color = "orange", icon }) {
  const colorClasses = {
    orange:
      "bg-gradient-to-br from-orange-50 to-orange-100/50 text-[#FC8019] border-orange-200",
    green:
      "bg-gradient-to-br from-green-50 to-green-100/50 text-green-600 border-green-200",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 border-blue-200",
  };

  return (
    <div
      className={`rounded-xl p-2.5 sm:p-5 border shadow-sm ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-0.5 sm:mb-1 leading-tight">
            {label}
          </p>
          <p className="text-lg sm:text-3xl font-black">{value}</p>
        </div>
        <div className="text-lg sm:text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}
