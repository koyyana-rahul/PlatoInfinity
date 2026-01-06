// src/modules/admin/restaurants/RestaurantsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiHome } from "react-icons/fi";

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

  /* ---------- FETCH ---------- */
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

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Restaurants</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage branches under this brand
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <FiPlus size={16} />
          Add Restaurant
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      {loading ? (
        <SkeletonGrid />
      ) : restaurants.length === 0 ? (
        <EmptyState onCreate={() => setOpenCreate(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
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

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-10 text-center max-w-lg mx-auto">
      <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
        <FiHome size={22} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        No restaurants yet
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        Create your first restaurant branch to start managing staff, orders, and
        daily operations.
      </p>

      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
      >
        <FiPlus size={16} />
        Add Restaurant
      </button>
    </div>
  );
}
