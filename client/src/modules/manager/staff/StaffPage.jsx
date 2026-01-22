// src/modules/manager/staff/StaffPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiPlus,
  FiInfo,
  FiSearch,
  FiUsers,
  FiActivity,
  FiUserX,
  FiTarget,
} from "react-icons/fi";
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
  const debouncedSearch = useDebounce(search);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await Axios(staffApi.list(restaurantId, debouncedSearch));
      setStaff(res.data?.data || []);
    } catch (err) {
      toast.error("Connectivity issue: Unable to sync staff records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) loadStaff();
  }, [restaurantId, debouncedSearch]);

  const updateStaff = (staffId, updates) => {
    setStaff((p) =>
      p.map((s) => (s._id === staffId ? { ...s, ...updates } : s)),
    );
  };

  const toggleStaff = (staffId) => {
    setStaff((p) =>
      p.map((s) =>
        s._id === staffId ? { ...s, isActive: !s.isActive, onDuty: false } : s,
      ),
    );
  };

  const grouped = useMemo(() => {
    return staff.reduce(
      (acc, s) => {
        acc[s.role] = acc[s.role] || [];
        acc[s.role].push(s);
        return acc;
      },
      { WAITER: [], CHEF: [], CASHIER: [] },
    );
  }, [staff]);

  const total = staff.length;
  const active = staff.filter((s) => s.isActive).length;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 overflow-x-hidden">
      {/* Background Decorative Blur - Controlled size for mobile */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative space-y-6 sm:space-y-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
              <FiTarget size={12} className="animate-pulse" /> Organization Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Staff Portal
            </h1>
            <p className="hidden sm:block text-sm font-medium text-slate-500 max-w-md">
              Securely oversee authentication and shift status for your entire
              restaurant workforce.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 active:scale-95 transition-all duration-300"
          >
            <FiPlus size={16} />
            Add Member
          </button>
        </div>

        {/* ================= CONTROLS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5 relative group">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, name or mobile..."
              className="w-full h-12 sm:h-14 pl-12 pr-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl text-sm font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
            />
          </div>

          <div className="lg:col-span-7 bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 text-[10px] sm:text-xs font-bold text-slate-500">
            <div className="hidden xs:flex p-2 bg-white rounded-lg shadow-sm text-emerald-500">
              <FiInfo size={16} />
            </div>
            <p className="leading-relaxed">
              Verify identity using{" "}
              <span className="text-slate-900">Staff Code</span>. Duplicate
              names are common; Codes are unique identifiers for payroll and
              security.
            </p>
          </div>
        </div>

        {/* ================= STATS CARD ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          <Stat icon={FiUsers} label="Total" value={total} color="slate" />
          <Stat
            icon={FiActivity}
            label="Active"
            value={active}
            color="emerald"
          />
          <Stat
            icon={FiUserX}
            label="Off"
            value={total - active}
            color="orange"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="relative min-h-[300px]">
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
        </div>

        {/* ================= MODAL ================= */}
        {openCreate && (
          <CreateStaffModal
            restaurantId={restaurantId}
            onClose={() => setOpenCreate(false)}
            onSuccess={() => {
              loadStaff();
              setOpenCreate(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Stat({ label, value, color, icon: Icon, className }) {
  const colors = {
    slate: "bg-slate-50 text-slate-900 border-slate-100",
    emerald:
      "bg-emerald-50/50 text-emerald-700 border-emerald-100 shadow-emerald-500/[0.03]",
    orange:
      "bg-orange-50/50 text-orange-700 border-orange-100 shadow-orange-500/[0.03]",
  };

  return (
    <div
      className={`flex items-center justify-between p-4 sm:p-6 border rounded-2xl sm:rounded-[28px] bg-white transition-all hover:shadow-lg group ${className}`}
    >
      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </p>
        <p
          className={`text-xl sm:text-3xl font-black tracking-tight ${colors[color].split(" ")[1]}`}
        >
          {value}
        </p>
      </div>
      <div
        className={`p-2.5 sm:p-4 rounded-lg sm:rounded-2xl border transition-all group-hover:scale-110 ${colors[color]}`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] sm:rounded-[40px] p-10 sm:p-20 text-center shadow-sm">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-4xl shadow-inner">
        👥
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
        Database Empty
      </h3>
      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-2 max-w-xs mx-auto">
        Your digital staff roster is currently blank. Start onboarding your team
        members.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 sm:mt-8 bg-slate-900 text-white px-8 py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-100"
      >
        Onboard Staff
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 sm:h-24 bg-white border border-slate-50 rounded-2xl sm:rounded-[32px] animate-pulse flex items-center px-4 sm:px-8 justify-between"
        >
          <div className="flex gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl" />
            <div className="space-y-2 py-1">
              <div className="w-24 sm:w-32 h-3 bg-slate-100 rounded" />
              <div className="w-16 sm:w-20 h-2 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="w-6 h-6 bg-slate-50 rounded-full" />
        </div>
      ))}
    </div>
  );
}
