import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiPlus,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import clsx from "clsx";

import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import managerApi from "../../../api/manager.api";

import InviteManagerModal from "./InviteManagerModal";
import ManagerTable from "./ManagerTable";
import ConfirmRemoveModal from "./ConfirmRemoveModal";

/**
 * Managers Page - Professional manager management interface
 * Fully responsive for mobile, tablet, and desktop
 */
export default function ManagersPage() {
  const { restaurantId, brandSlug } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [openInvite, setOpenInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadManagers = useCallback(async () => {
    try {
      const res = await Axios(restaurantApi.managers(restaurantId));
      setManagers(res.data.data || []);
    } catch (err) {
      console.error("Failed to load managers:", err);
    }
  }, [restaurantId]);

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        const r = await Axios(restaurantApi.getById(restaurantId));
        setRestaurant(r.data.data);
        await loadManagers();
      } catch (err) {
        console.error("Failed to initialize:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, [restaurantId, loadManagers]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadManagers, 10000);
    const onFocus = () => loadManagers();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadManagers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadManagers();
    setRefreshing(false);
    toast.success("Refreshed");
  };

  const handleResend = async (managerId) => {
    try {
      const toastId = toast.loading("Sending invite...");
      await Axios(managerApi.resendInvite(restaurantId, managerId));
      toast.success("Invite resent successfully", { id: toastId });
      loadManagers();
    } catch (err) {
      toast.error("Failed to resend invite");
    }
  };

  const handleRemove = async () => {
    try {
      setActionLoading(true);
      const toastId = toast.loading("Removing manager...");
      await Axios(managerApi.removeManager(restaurantId, removeTarget._id));
      toast.success("Manager access revoked", { id: toastId });
      setRemoveTarget(null);
      loadManagers();
    } catch (err) {
      toast.error("Failed to remove manager");
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = managers.filter((m) => m.isActive).length;
  const invitedCount = managers.length - activeCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* ================= HEADER ================= */}
        <div className="space-y-4 sm:space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/${brandSlug}/admin/restaurants`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm font-semibold">Back</span>
          </button>

          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                👥 Manager Access
              </h1>
              <p className="text-slate-600 mt-2">
                {restaurant?.name || "Restaurant"} • Manage administrative
                access
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
              >
                <FiRefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline text-sm font-semibold">
                  Refresh
                </span>
              </button>

              <button
                onClick={() => setOpenInvite(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition shadow-lg hover:shadow-xl"
              >
                <FiPlus size={20} />
                <span className="hidden sm:inline">Invite Manager</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= STATISTICS ================= */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={FiUsers}
              label="Total Managers"
              value={managers.length}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
            />
            <StatCard
              icon={FiUserCheck}
              label="Active Managers"
              value={activeCount}
              bgColor="bg-emerald-50"
              textColor="text-emerald-600"
            />
            <StatCard
              icon={FiClock}
              label="Pending Invites"
              value={invitedCount}
              bgColor="bg-orange-50"
              textColor="text-orange-600"
            />
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <div className="pt-2">
          {loading ? (
            <LoadingState />
          ) : managers.length === 0 ? (
            <EmptyState onInvite={() => setOpenInvite(true)} />
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

      {/* ================= MODALS ================= */}
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

/**
 * Statistic Card Component
 */
function StatCard({ icon: Icon, label, value, bgColor, textColor }) {
  return (
    <div
      className={`${bgColor} rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition group`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`${textColor} p-3 rounded-lg group-hover:scale-110 transition`}
        >
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onInvite }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <FiUsers size={32} className="text-slate-300" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        No managers yet
      </h3>
      <p className="text-slate-600 max-w-sm mx-auto mb-6">
        Invite your first manager to manage this restaurant and its operations
      </p>
      <button
        onClick={onInvite}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition"
      >
        <FiPlus size={20} />
        Invite Manager
      </button>
    </div>
  );
}
