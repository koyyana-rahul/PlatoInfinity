import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiPlus,
  FiArrowLeft,
  FiActivity,
} from "react-icons/fi";
import clsx from "clsx";

import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import managerApi from "../../../api/manager.api";

import InviteManagerModal from "./InviteManagerModal";
import ManagerTable from "./ManagerTable";
import ConfirmRemoveModal from "./ConfirmRemoveModal";

export default function ManagersPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openInvite, setOpenInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadManagers = useCallback(async () => {
    try {
      const res = await Axios(restaurantApi.managers(restaurantId));
      setManagers(res.data.data);
    } catch {
      // Quiet background failure
    }
  }, [restaurantId]);

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        const r = await Axios(restaurantApi.getById(restaurantId));
        setRestaurant(r.data.data);
        await loadManagers();
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, [restaurantId, loadManagers]);

  useEffect(() => {
    const interval = setInterval(loadManagers, 10000);
    const onFocus = () => loadManagers();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadManagers]);

  const handleResend = async (managerId) => {
    try {
      toast.loading("Re-authorizing...", { id: "resend" });
      await Axios(managerApi.resendInvite(restaurantId, managerId));
      toast.success("Dispatched", { id: "resend" });
    } catch (err) {
      toast.error("Failed", { id: "resend" });
    }
  };

  const handleRemove = async () => {
    try {
      setActionLoading(true);
      await Axios(managerApi.removeManager(restaurantId, removeTarget._id));
      toast.success("Access revoked");
      setRemoveTarget(null);
      loadManagers();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = managers.filter((m) => m.isActive).length;
  const invitedCount = managers.length - activeCount;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="px-4 pb-10 pt-4 sm:px-10 sm:pt-8 space-y-6 sm:space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors w-fit"
          >
            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Units
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                Authority Hub
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {restaurant?.name || "Initializing..."} • Managed Live
                </p>
              </div>
            </div>

            {/* Main Action: Emerald-500 */}
            <button
              onClick={() => setOpenInvite(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-7 py-3.5 sm:py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-[0.97]"
            >
              <FiPlus size={16} strokeWidth={3} />
              Invite Manager
            </button>
          </div>
        </div>

        {/* ================= METRICS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <StatCard
            icon={FiUsers}
            label="Total Members"
            value={managers.length}
            color="slate"
          />
          <StatCard
            icon={FiUserCheck}
            label="Active Admins"
            value={activeCount}
            color="emerald"
          />
          <StatCard
            icon={FiClock}
            label="Pending Access"
            value={invitedCount}
            color="orange"
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="pt-2">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-[28px] bg-white border border-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-3 duration-500">
              <ManagerTable
                managers={managers}
                onResend={handleResend}
                onRemove={(m) => setRemoveTarget(m)}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {openInvite && (
        <InviteManagerModal
          restaurantId={restaurantId}
          onClose={() => setOpenInvite(false)}
          onSuccess={loadManagers}
        />
      )}

      {removeTarget && (
        <ConfirmRemoveModal
          manager={removeTarget}
          loading={actionLoading}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemove}
        />
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({ icon: Icon, label, value, color }) {
  const themes = {
    slate: "text-slate-400 bg-slate-50",
    emerald: "text-emerald-500 bg-emerald-50",
    orange: "text-orange-500 bg-orange-50",
  };

  return (
    <div className="group relative p-5 rounded-[28px] border border-slate-100 bg-white transition-all hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.04)] flex items-center justify-between overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        {/* Background Decorative Icon */}
        <div className="absolute -right-16 -bottom-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
          <Icon size={100} />
        </div>

        <div
          className={clsx(
            "h-11 w-11 rounded-2xl flex items-center justify-center shadow-inner shrink-0 transition-all duration-500 group-hover:bg-emerald-500 group-hover:text-white",
            themes[color],
          )}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
            {value}
          </p>
        </div>
      </div>

      <div className="h-1 w-1 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
    </div>
  );
}
