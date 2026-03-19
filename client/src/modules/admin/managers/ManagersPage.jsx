import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notify } from "../../../utils/notify";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiPlus,
  FiArrowLeft,
  FiRefreshCw,
  FiChevronRight,
} from "react-icons/fi";
import clsx from "clsx";

import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import managerApi from "../../../api/manager.api";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

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
        notify.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, [restaurantId, loadManagers]);

  // Auto-refresh every 45 seconds, pause when modals are open
  const isModalOpen = openInvite || removeTarget;
  useAutoRefresh(loadManagers, 45000, {
    enabled: !isModalOpen,
    pauseWhenHidden: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadManagers();
    setRefreshing(false);
    notify.success("Data refreshed");
  };

  const handleResend = async (managerId) => {
    try {
      const toastId = notify.loading("Sending invite...");
      await Axios(managerApi.resendInvite(restaurantId, managerId));
      notify.success("Invite resent successfully", { id: toastId });
      loadManagers();
    } catch (err) {
      notify.error("Failed to resend invite");
    }
  };

  const handleRemove = async () => {
    try {
      setActionLoading(true);
      const toastId = notify.loading("Removing manager...");
      await Axios(managerApi.removeManager(restaurantId, removeTarget._id));
      notify.success("Manager access revoked", { id: toastId });
      setRemoveTarget(null);
      loadManagers();
    } catch (err) {
      notify.error("Failed to remove manager");
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = managers.filter((m) => m.isActive).length;
  const invitedCount = managers.length - activeCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 p-2.5 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* ================= BREADCRUMB NAVIGATION ================= */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-wrap">
          <button
            onClick={() => navigate(`/${brandSlug}/admin/restaurants`)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-white transition-all flex items-center gap-1 border border-transparent hover:border-gray-200"
          >
            <FiArrowLeft size={14} strokeWidth={2.5} />
            <span className="hidden xs:inline">Restaurants</span>
          </button>
          <span className="text-gray-300 text-xs">•</span>
          <span className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-700 font-semibold bg-white border-2 border-gray-100 text-xs sm:text-sm truncate">
            {restaurant?.name || "Loading..."}
          </span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white font-bold bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-orange-600 text-xs sm:text-sm">
            <span className="flex items-center gap-0.5 sm:gap-1.5">
              <FiUsers size={14} />
              <span className="hidden xs:inline">Managers</span>
            </span>
          </span>
        </nav>

        {/* ================= RESTAURANT INFO CARD ================= */}
        {restaurant && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-lg ring-3 sm:ring-4 ring-orange-100">
                  🏪
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                      {restaurant.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
                      {restaurant.addressText || "Address not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-2 sm:mt-3">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border-2",
                      !restaurant.isArchived
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-200 text-gray-700 border-gray-300",
                    )}
                  >
                    <span
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        !restaurant.isArchived ? "bg-green-500" : "bg-gray-500",
                      )}
                    />
                    {!restaurant.isArchived ? "Active" : "Inactive"}
                  </span>
                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors px-2.5 sm:px-3 py-1 sm:py-1.5 bg-orange-50 rounded-full border-2 border-orange-200 truncate"
                    >
                      📞 {restaurant.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PAGE HEADER WITH ACTIONS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Manager Access
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold">
              Invite and manage restaurant administrators
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-sm border-2 border-gray-200 hover:border-orange-300 disabled:opacity-50 active:scale-95 shadow-md hover:shadow-lg h-10 sm:h-11 md:h-12"
            >
              <FiRefreshCw
                size={16}
                strokeWidth={2.5}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setOpenInvite(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 border-2 border-orange-600 h-10 sm:h-11 md:h-12 whitespace-nowrap"
            >
              <FiPlus size={18} strokeWidth={2.5} />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* ================= MANAGER STATISTICS ================= */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Managers */}
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-3.5 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 sm:hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg sm:rounded-xl">
                  <FiUsers
                    className="text-blue-600"
                    size={20}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1.5 sm:mb-2">
                Total
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-600 tracking-tight">
                {managers.length}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                All managers & invites
              </p>
            </div>

            {/* Active Managers */}
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-3.5 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 sm:hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-green-100 to-emerald-50 rounded-lg sm:rounded-xl">
                  <FiUserCheck
                    className="text-green-600"
                    size={20}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1.5 sm:mb-2">
                Active
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-green-600 tracking-tight">
                {activeCount}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                Confirmed & verified
              </p>
            </div>

            {/* Pending Invites */}
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-3.5 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 sm:hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg sm:rounded-xl">
                  <FiClock
                    className="text-orange-600"
                    size={20}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1.5 sm:mb-2">
                Pending
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-orange-600 tracking-tight">
                {invitedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                Awaiting acceptance
              </p>
            </div>
          </div>
        )}

        {/* ================= CONTENT ================= */}
        <div className="pt-1 sm:pt-2 space-y-4 sm:space-y-6">
          {/* Helpful Tip Banner */}
          {managers.length === 0 && !loading && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl border-2 border-blue-200 p-3.5 sm:p-5 md:p-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 text-lg sm:text-xl">💡</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-blue-900 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base">
                    Getting Started
                  </h3>
                  <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                    Managers can view orders, handle payments, manage tables,
                    and control kitchen operations. Each manager gets their own
                    login credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Managers List or Empty/Loading State */}
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
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 sm:h-32 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 animate-pulse"
          />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 sm:h-16 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onInvite }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16">
      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-4 sm:mb-6 border-4 border-orange-200 shadow-lg">
        <FiUsers className="text-orange-600" size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2 text-center">
        No managers yet
      </h3>
      <p className="text-gray-600 text-center max-w-sm mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
        Invite your first manager to manage this restaurant and its operations
      </p>
      <button
        onClick={onInvite}
        className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 border-2 border-orange-600"
      >
        <FiPlus size={18} strokeWidth={2.5} />
        <span>Invite Manager</span>
      </button>
    </div>
  );
}
