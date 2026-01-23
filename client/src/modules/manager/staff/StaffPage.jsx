import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  FiPlus,
  FiInfo,
  FiSearch,
  FiUsers,
  FiActivity,
  FiUserX,
  FiTarget,
  FiRefreshCcw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import clsx from "clsx";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const loadStaff = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        const res = await Axios(staffApi.list(restaurantId, debouncedSearch));
        setStaff(res.data?.data || []);
      } catch (err) {
        toast.error("Cloud Sync Interrupted");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [restaurantId, debouncedSearch],
  );

  useEffect(() => {
    if (restaurantId) loadStaff();
  }, [loadStaff, restaurantId]);

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
    <div className="min-h-screen bg-[#F8FAF9] pb-24 overflow-x-hidden selection:bg-emerald-100">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-500/[0.04] blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-100 shadow-sm text-emerald-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                <FiTarget size={10} className="animate-pulse" /> Terminal
                Registry
              </div>
              {isRefreshing && (
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase animate-pulse">
                  <FiRefreshCcw className="animate-spin" size={10} /> Sync
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Staff <span className="text-slate-400">Identity</span>
            </h1>
            <p className="hidden xs:block text-[11px] sm:text-[13px] font-medium text-slate-500 max-w-md leading-relaxed">
              Global workforce directory for{" "}
              <span className="text-slate-900 font-bold">Dine-OS</span>.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2.5 bg-slate-900 text-white w-full sm:w-auto px-6 py-4 rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] shadow-xl shadow-slate-200 active:scale-[0.96] transition-all duration-300"
          >
            <FiPlus size={16} strokeWidth={3} /> Onboard Member
          </button>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="bg-white p-1.5 sm:p-2 rounded-[24px] sm:rounded-[28px] border border-slate-100 shadow-sm ring-1 ring-black/[0.02]">
          <div className="relative group">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search via UID, Name or Duty..."
              className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-50/50 border border-transparent rounded-[18px] sm:rounded-[22px] text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-[5px] focus:ring-emerald-500/5 transition-all"
            />
          </div>
        </div>

        {/* ================= STATS GRID ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          <Stat icon={FiUsers} label="Inventory" value={total} color="slate" />
          <Stat
            icon={FiActivity}
            label="Active"
            value={active}
            color="emerald"
          />
          <Stat
            icon={FiUserX}
            label="Inactive"
            value={total - active}
            color="orange"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 sm:h-24 bg-slate-100 animate-pulse rounded-[22px] sm:rounded-[28px]"
                />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-[28px] sm:rounded-[32px] border-2 border-dashed border-slate-100 text-center px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                <FiUsers size={28} />
              </div>
              <p className="text-[11px] sm:text-sm font-black text-slate-400 uppercase tracking-widest leading-tight">
                No Active Registry Entries
              </p>
              <button
                onClick={() => setOpenCreate(true)}
                className="mt-4 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Start Onboarding
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
        </div>

        {openCreate && (
          <CreateStaffModal
            restaurantId={restaurantId}
            onClose={() => setOpenCreate(false)}
            onSuccess={() => {
              loadStaff(true);
              setOpenCreate(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon: Icon, className }) {
  const themes = {
    slate: "bg-slate-50 text-slate-900 border-slate-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-between p-3 sm:p-6 border rounded-[22px] sm:rounded-[32px] bg-white transition-all duration-300 active:scale-[0.98]",
        className,
      )}
    >
      <div className="space-y-0.5 min-w-0">
        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
          {label}
        </p>
        <p
          className={clsx(
            "text-lg sm:text-3xl font-black tracking-tighter tabular-nums",
            themes[color].split(" ")[1],
          )}
        >
          {value}
        </p>
      </div>
      <div
        className={clsx(
          "p-2 sm:p-4 rounded-xl sm:rounded-[20px] border shrink-0 ml-2 transition-transform group-hover:scale-110",
          themes[color],
        )}
      >
        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
    </div>
  );
}
