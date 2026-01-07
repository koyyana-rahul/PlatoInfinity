// src/modules/manager/staff/StaffPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiPlus, FiInfo, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";

import StaffAccordion from "./StaffAccordion";
import CreateStaffModal from "./CreateStaffModal";

/* ================= DEBOUNCE HOOK ================= */
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
  const debouncedSearch = useDebounce(search);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  /* ================= INITIAL LOAD ================= */
  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await Axios(staffApi.list(restaurantId, debouncedSearch));
      setStaff(res.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) loadStaff();
  }, [restaurantId, debouncedSearch]);

  /* ================= LOCAL UPDATE HANDLERS ================= */

  // Used after PIN regenerate or shift updates
  const updateStaff = (staffId, updates) => {
    setStaff((prev) =>
      prev.map((s) => (s._id === staffId ? { ...s, ...updates } : s))
    );
  };

  // Used after activate / deactivate
  const toggleStaff = (staffId) => {
    setStaff((prev) =>
      prev.map((s) =>
        s._id === staffId
          ? {
              ...s,
              isActive: !s.isActive,
              staffPin: s.isActive ? null : s.staffPin,
              onDuty: false,
            }
          : s
      )
    );
  };

  /* ================= GROUP BY ROLE ================= */
  const grouped = useMemo(() => {
    return staff.reduce(
      (acc, s) => {
        acc[s.role] = acc[s.role] || [];
        acc[s.role].push(s);
        return acc;
      },
      { WAITER: [], CHEF: [], CASHIER: [] }
    );
  }, [staff]);

  const total = staff.length;
  const active = staff.filter((s) => s.isActive).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Restaurant Staff
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Identify staff using <strong>Staff Code</strong> & secure PIN
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="
            inline-flex items-center gap-2
            bg-emerald-600 hover:bg-emerald-700
            text-white text-sm font-medium
            px-4 py-2 rounded-lg shadow-sm
          "
        >
          <FiPlus /> Add Staff
        </button>
      </div>

      {/* ================= SEARCH + INFO ================= */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* SEARCH */}
        <div className="relative w-full max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code / name / mobile"
            className="
              w-full pl-10 pr-3 py-2
              border border-gray-300 rounded-lg
              text-sm text-gray-900
              placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500
            "
          />
        </div>

        {/* INFO */}
        <div className="flex gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
          <FiInfo className="mt-0.5 shrink-0 text-emerald-700" />
          <p>
            Staff names may repeat. Always rely on <strong>Staff Code</strong>{" "}
            <span className="font-mono">(WTR-004)</span>.
          </p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Total Staff" value={total} />
        <Stat label="Active" value={active} color="emerald" />
        <Stat label="Inactive" value={total - active} color="orange" />
      </div>

      {/* ================= CONTENT ================= */}
      {loading ? (
        <Skeleton />
      ) : total === 0 ? (
        <EmptyState onAdd={() => setOpenCreate(true)} />
      ) : (
        <StaffAccordion
          grouped={grouped}
          restaurantId={restaurantId}
          onUpdateStaff={updateStaff}
          onToggleStaff={toggleStaff}
        />
      )}

      {/* ================= CREATE MODAL ================= */}
      {openCreate && (
        <CreateStaffModal
          restaurantId={restaurantId}
          onClose={() => setOpenCreate(false)}
          onSuccess={loadStaff}
        />
      )}
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Stat({ label, value, color = "gray" }) {
  const colors = {
    gray: "text-gray-900",
    emerald: "text-emerald-700",
    orange: "text-orange-700",
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-700">{label}</p>
      <p className={`text-2xl font-semibold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-white border rounded-xl p-12 text-center">
      <div className="text-5xl mb-3">👥</div>
      <h3 className="font-semibold text-lg text-gray-900">
        No staff added yet
      </h3>
      <p className="text-sm text-gray-700 mt-2">
        Start by adding your first staff member
      </p>
      <button
        onClick={onAdd}
        className="
          mt-6 bg-emerald-600 hover:bg-emerald-700
          text-white px-5 py-2 rounded-lg text-sm
        "
      >
        Add Staff
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
