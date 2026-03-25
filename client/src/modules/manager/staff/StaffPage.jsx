import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";

import StaffAccordion from "./StaffAccordion";
import CreateStaffModal from "./CreateStaffModal";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function StaffPage() {
  const { restaurantId } = useParams();

  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadStaff = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await Axios(staffApi.list(restaurantId, debouncedSearch));
        setStaff(res.data?.data || []);
      } catch {
        toast.error("Unable to load staff");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [restaurantId, debouncedSearch],
  );

  useEffect(() => {
    if (restaurantId) loadStaff();
  }, [loadStaff, restaurantId]);

  const updateStaff = (staffId, updates) => {
    setStaff((prev) =>
      prev.map((s) => (s._id === staffId ? { ...s, ...updates } : s)),
    );
  };

  const toggleStaff = (staffId) => {
    setStaff((prev) =>
      prev.map((s) =>
        s._id === staffId ? { ...s, isActive: !s.isActive, onDuty: false } : s,
      ),
    );
  };

  const grouped = useMemo(() => {
    const base = { WAITER: [], CHEF: [], CASHIER: [] };
    if (!Array.isArray(staff)) return base;

    return staff.reduce((acc, s) => {
      const role = s.role?.toUpperCase() || "OTHER";
      acc[role] = acc[role] || [];
      acc[role].push(s);
      return acc;
    }, base);
  }, [staff]);

  const total = staff?.length || 0;
  const active = staff?.filter((s) => s?.isActive)?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Staff Management
            </h1>
            <p className="text-gray-600 text-sm">Manage your restaurant team</p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 hover:-translate-y-0.5"
          >
            <FiPlus size={18} />
            Add Staff
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-gray-600 text-sm font-medium">Total Staff</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-green-700 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{active}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-red-700 text-sm font-medium">Inactive</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {total - active}
            </p>
          </div>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FiUsers className="mx-auto text-gray-400 mb-4" size={40} />
            <p className="text-gray-600 font-medium">No staff members found</p>
            <button
              onClick={() => setOpenCreate(true)}
              className="mt-4 text-orange-500 font-semibold hover:underline"
            >
              Add your first member
            </button>
          </div>
        ) : (
          <StaffAccordion
            grouped={grouped}
            restaurantId={restaurantId}
            onUpdateStaff={updateStaff}
            onToggleStaff={toggleStaff}
          />
        )}

        {openCreate && (
          <CreateStaffModal
            restaurantId={restaurantId}
            onClose={() => setOpenCreate(false)}
            onSuccess={() => {
              loadStaff(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
