import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

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

  /* ---------- LOAD MANAGERS ---------- */
  const loadManagers = useCallback(async () => {
    try {
      const res = await Axios(restaurantApi.managers(restaurantId));
      setManagers(res.data.data);
    } catch {
      toast.error("Failed to load managers");
    }
  }, [restaurantId]);

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const r = await Axios(restaurantApi.getById(restaurantId));
        setRestaurant(r.data.data);
        await loadManagers();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [restaurantId, loadManagers]);

  /* ---------- 🔁 AUTO REFRESH ---------- */
  useEffect(() => {
    const interval = setInterval(loadManagers, 10000);
    return () => clearInterval(interval);
  }, [loadManagers]);

  useEffect(() => {
    const onFocus = () => loadManagers();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadManagers]);

  /* ---------- RESEND ---------- */
  const handleResend = async (managerId) => {
    try {
      toast.loading("Resending invite…", { id: "resend" });
      await Axios(managerApi.resendInvite(restaurantId, managerId));
      toast.success("Invite resent", { id: "resend" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed", { id: "resend" });
    }
  };

  /* ---------- REMOVE ---------- */
  const handleRemove = async () => {
    try {
      setActionLoading(true);
      await Axios(managerApi.removeManager(restaurantId, removeTarget._id));
      toast.success("Manager removed");
      setRemoveTarget(null);
      loadManagers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = managers.filter((m) => m.isActive).length;
  const invitedCount = managers.length - activeCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* ================= HEADER ================= */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Managers</h1>
              <p className="text-sm text-gray-500 mt-1">
                {restaurant?.name} · Updates in real time
              </p>
            </div>

            {/* Primary Action */}
            <button
              onClick={() => setOpenInvite(true)}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm"
            >
              <FiPlus size={16} />
              Invite Manager
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={FiUsers}
            label="Total Managers"
            value={managers.length}
          />
          <StatCard
            icon={FiUserCheck}
            label="Active"
            value={activeCount}
            color="green"
          />
          <StatCard
            icon={FiClock}
            label="Invited"
            value={invitedCount}
            color="orange"
          />
        </div>

        {/* ================= INFO ================= */}
        {/* <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">
          <FiRefreshCw className="text-emerald-700 mt-0.5" />
          <p className="text-sm text-emerald-800 leading-relaxed">
            Manager status updates automatically when invites are accepted — no
            page refresh required.
          </p>
        </div> */}

        {/* ================= CONTENT ================= */}
        {loading ? (
          <Skeleton />
        ) : (
          <ManagerTable
            managers={managers}
            onResend={handleResend}
            onRemove={(m) => setRemoveTarget(m)}
          />
        )}
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

/* ================= SMALL UI PARTS ================= */

function StatCard({ icon: Icon, label, value, color = "gray" }) {
  const colorMap = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
      <div
        className={`h-11 w-11 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
