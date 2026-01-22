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

  const loadStaff = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const res = await Axios(staffApi.list(restaurantId, debouncedSearch));
      // Defensive check for data existence
      setStaff(res.data?.data || []);
    } catch (err) {
      toast.error("Connectivity issue: Unable to sync staff records");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
        if (!s || !s.role) return acc; // Defense against malformed objects
        const role = s.role.toUpperCase();
        acc[role] = acc[role] || [];
        acc[role].push(s);
        return acc;
      },
      { WAITER: [], CHEF: [], CASHIER: [] },
    );
  }, [staff]);

  const total = staff?.length || 0;
  const active = staff?.filter((s) => s?.isActive)?.length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20 overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative space-y-6 sm:space-y-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                <FiTarget size={12} className="animate-pulse" /> Organization Hub
              </div>
              {isRefreshing && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <FiRefreshCcw className="animate-spin" /> Syncing
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Staff Identity
            </h1>
            <p className="hidden sm:block text-sm font-medium text-slate-500 max-w-md leading-relaxed">
              Verify credentials and monitor workforce activity across your enterprise terminal.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2.5 bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 active:scale-95 transition-all duration-300"
          >
            <FiPlus size={16} strokeWidth={3} />
            Onboard Member
          </button>
        </div>

        {/* ================= CONTROLS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch bg-white p-2 sm:p-3 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="lg:col-span-5 relative group">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Name or Terminal..."
              className="w-full h-12 sm:h-14 pl-12 pr-4 bg-slate-50/50 border border-transparent rounded-xl sm:rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
            />
          </div>

          <div className="lg:col-span-7 bg-slate-50/30 border border-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="hidden xs:flex p-2 bg-white rounded-lg shadow-sm text-emerald-500">
              <FiInfo size={16} />
            </div>
            <p className="leading-relaxed">
              Codes are unique identifiers for <span className="text-slate-600">Payroll Security</span>.
            </p>
          </div>
        </div>

        {/* ================= STATS CARD ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          <Stat icon={FiUsers} label="Total Inventory" value={total} color="slate" />
          <Stat icon={FiActivity} label="Active Duty" value={active} color="emerald" />
          <Stat icon={FiUserX} label="Off Grid" value={total - active} color="orange" className="col-span-2 sm:col-span-1" />
        </div>

        {/* ================= CONTENT (Defensive) ================= */}
        <div className="relative min-h-[300px]">
          {loading ? (
            <Skeleton />
          ) : !staff || staff.length === 0 ? (
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

/* ================= UI COMPONENTS ================= */

function Stat({ label, value, color, icon: Icon, className }) {
  const colors = {
    slate: "bg-slate-50 text-slate-900 border-slate-100",
    emerald: "bg-emerald-50/50 text-emerald-700 border-emerald-100 shadow-emerald-500/[0.03]",
    orange: "bg-orange-50/50 text-orange-700 border-orange-100 shadow-orange-500/[0.03]",
  };

  return (
    <div className={clsx(
      "flex items-center justify-between p-4 sm:p-6 border rounded-2xl sm:rounded-[28px] bg-white transition-all hover:shadow-lg group",
      className
    )}>
      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </p>
        <p className={clsx("text-xl sm:text-3xl font-black tracking-tight tabular-nums", colors[color].split(" ")[1])}>
          {value}
        </p>
      </div>
      <div className={clsx("p-2.5 sm:p-4 rounded-lg sm:rounded-2xl border transition-all group-hover:scale-110 shrink-0", colors[color])}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
  );
}

// ... Keep Skeleton and EmptyState as they are but ensure they use your rounded-[32px] logic