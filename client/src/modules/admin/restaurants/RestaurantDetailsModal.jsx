import { useState } from "react";
import clsx from "clsx";
import {
  FiX,
  FiEdit2,
  FiMapPin,
  FiPhone,
  FiSave,
  FiLoader,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";

/**
 * Restaurant Details Modal - View and edit with professional design
 */
export default function RestaurantDetailsModal({
  restaurant,
  brandSlug,
  onClose,
  onSuccess,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: restaurant.name || "",
    phone: restaurant.phone || "",
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    const toastId = toast.loading("Updating restaurant...");
    setLoading(true);

    try {
      await Axios.put(`/api/restaurants/${restaurant._id}`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

      toast.success("Restaurant updated successfully", { id: toastId });
      setIsEditing(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update restaurant",
        {
          id: toastId,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const isActive = !restaurant.isArchived;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* HEADER */}
        <div
          className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b transition-colors ${
            isActive
              ? "bg-emerald-50/50 border-emerald-100"
              : "bg-slate-50/50 border-slate-200"
          } flex justify-between items-start gap-4 shrink-0`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl sm:text-3xl">🏪</span>
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">
                Restaurant Details
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold truncate">
              {restaurant.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* STATUS & MANAGERS GRID */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div
              className={clsx(
                "rounded-lg sm:rounded-xl p-4 sm:p-5 border transition-colors",
                isActive
                  ? "bg-emerald-50/50 border-emerald-200/50"
                  : "bg-red-50/50 border-red-200/50",
              )}
            >
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                Status
              </p>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <FiCheckCircle
                      className="text-emerald-600 shrink-0"
                      size={18}
                      strokeWidth={2.5}
                    />
                    <p className="text-sm sm:text-base font-bold text-emerald-700">
                      Active
                    </p>
                  </>
                ) : (
                  <>
                    <FiX
                      className="text-red-600 shrink-0"
                      size={18}
                      strokeWidth={2.5}
                    />
                    <p className="text-sm sm:text-base font-bold text-red-700">
                      Inactive
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg sm:rounded-xl p-4 sm:p-5">
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                Managers
              </p>
              <div className="flex items-center gap-2">
                <FiUsers
                  className="text-blue-600 shrink-0"
                  size={18}
                  strokeWidth={2.5}
                />
                <p className="text-sm sm:text-base font-bold text-blue-700">
                  {restaurant.managerCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* LOCATION INFO */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <FiMapPin
                size={16}
                className="text-emerald-600 shrink-0 sm:w-5 sm:h-5"
                strokeWidth={2.5}
              />
              Location Details
            </h3>
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-5 space-y-2.5">
              {restaurant.addressText && (
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                    Address
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {restaurant.addressText}
                  </p>
                </div>
              )}
              {restaurant.meta?.address?.city && (
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                    City
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {restaurant.meta.address.city}
                  </p>
                </div>
              )}
              {restaurant.meta?.address?.pincode && (
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                    Pincode
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 font-mono">
                    {restaurant.meta.address.pincode}
                  </p>
                </div>
              )}
              {restaurant.meta?.address?.state && (
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                    State
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {restaurant.meta.address.state}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* EDITABLE FIELDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <FiEdit2
                  size={16}
                  className="text-blue-600 shrink-0 sm:w-5 sm:h-5"
                  strokeWidth={2.5}
                />
                Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg transition font-bold uppercase tracking-tight disabled:opacity-50"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 p-4 sm:p-5 bg-slate-50/50 border border-slate-200 rounded-lg sm:rounded-xl">
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl bg-white text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-blue-50/30 outline-none transition disabled:opacity-50"
                    placeholder="e.g., Downtown Branch"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg sm:rounded-xl bg-white text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-blue-50/30 outline-none transition disabled:opacity-50"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 sm:p-4 bg-slate-50/50 border border-slate-200 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                    Name
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900">
                    {form.name}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-slate-50/50 border border-slate-200 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <FiPhone
                      size={12}
                      className="text-blue-600 sm:w-4 sm:h-4"
                    />
                    Phone
                  </p>
                  <a
                    href={`tel:${form.phone}`}
                    className="text-sm sm:text-base font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    {form.phone || "Not provided"}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t transition-colors shrink-0 flex items-center justify-between gap-3 ${
            isActive
              ? "bg-emerald-50/30 border-emerald-100"
              : "bg-slate-50/30 border-slate-200"
          }`}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 uppercase tracking-tight"
          >
            Close
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={loading}
              className={clsx(
                "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-tight transition-all active:scale-95 disabled:opacity-60",
                loading
                  ? "bg-slate-300 text-slate-500 cursor-wait"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50",
              )}
            >
              {loading ? (
                <>
                  <FiLoader size={14} className="animate-spin sm:w-4 sm:h-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave
                    size={14}
                    className="sm:w-4 sm:h-4"
                    strokeWidth={2.5}
                  />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
