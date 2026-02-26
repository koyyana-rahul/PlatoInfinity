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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        {/* ================= HEADER ================= */}
        <div className="space-y-3 sm:space-y-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/${brandSlug}/admin/restaurants`)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
          >
            <FiArrowLeft size={16} />
            Back to Restaurants
          </button>

          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
                Manager Access Control
              </h1>
              <p className="text-sm text-gray-600">
                {restaurant?.name || "Restaurant"} • Manage administrative
                access
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition font-medium text-sm border border-gray-200 shadow-sm disabled:opacity-50"
              >
                <FiRefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => setOpenInvite(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-[0.98]"
              >
                <FiPlus size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Invite Manager</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= STATISTICS ================= */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              icon={FiUsers}
              label="Total Managers"
              value={managers.length}
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100/50"
              textColor="text-blue-600"
              borderColor="border-blue-200"
            />
            <StatCard
              icon={FiUserCheck}
              label="Active Managers"
              value={activeCount}
              bgColor="bg-gradient-to-br from-green-50 to-green-100/50"
              textColor="text-green-600"
              borderColor="border-green-200"
            />
            <StatCard
              icon={FiClock}
              label="Pending Invites"
              value={invitedCount}
              bgColor="bg-gradient-to-br from-orange-50 to-orange-100/50"
              textColor="text-[#FC8019]"
              borderColor="border-orange-200"
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
            <ManagerTable
              managers={managers}
              onResend={handleResend}
              onRemove={(m) => setRemoveTarget(m)}
            />
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
function StatCard({
  icon: Icon,
  label,
  value,
  bgColor,
  textColor,
  borderColor,
}) {
  return (
    <div
      className={`${bgColor} rounded-xl p-4 sm:p-5 border ${borderColor} shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold">
            <span className={textColor}>{value}</span>
          </p>
        </div>
        <div className={`p-3 rounded-lg ${textColor} opacity-60`}>
          <Icon size={24} />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse"
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center max-w-md mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-5 border-2 border-gray-200">
        <FiUsers size={32} />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        No managers yet
      </h3>
      <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
        Invite your first manager to manage this restaurant and its operations
      </p>
      <button
        onClick={onInvite}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-[0.98]"
      >
        <FiPlus size={18} strokeWidth={2.5} />
        Invite Manager
      </button>
    </div>
  );
}
