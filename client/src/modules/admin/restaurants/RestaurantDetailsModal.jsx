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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-start gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">🏪</span>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Restaurant Details
              </h2>
            </div>
            <p className="text-sm text-gray-600 truncate">{restaurant.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* STATUS & MANAGERS GRID */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div
              className={clsx(
                "rounded-xl p-4 border",
                isActive
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200",
              )}
            >
              <p className="text-xs font-medium text-gray-600 mb-2">Status</p>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <FiCheckCircle
                      className="text-green-600 shrink-0"
                      size={18}
                    />
                    <p className="text-sm font-semibold text-green-700">
                      Active
                    </p>
                  </>
                ) : (
                  <>
                    <FiX className="text-red-600 shrink-0" size={18} />
                    <p className="text-sm font-semibold text-red-700">
                      Inactive
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Managers</p>
              <div className="flex items-center gap-2">
                <FiUsers className="text-blue-600 shrink-0" size={18} />
                <p className="text-sm font-semibold text-blue-700">
                  {restaurant.managerCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* LOCATION INFO */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FiMapPin size={16} className="text-[#FC8019]" />
              Location Details
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              {restaurant.addressText && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Address
                  </p>
                  <p className="text-sm text-gray-900">
                    {restaurant.addressText}
                  </p>
                </div>
              )}
              {restaurant.meta?.address?.city && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">City</p>
                  <p className="text-sm text-gray-900">
                    {restaurant.meta.address.city}
                  </p>
                </div>
              )}
              {restaurant.meta?.address?.pincode && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Pincode
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    {restaurant.meta.address.pincode}
                  </p>
                </div>
              )}
              {restaurant.meta?.address?.state && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    State
                  </p>
                  <p className="text-sm text-gray-900">
                    {restaurant.meta.address.state}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* EDITABLE FIELDS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FiEdit2 size={16} className="text-blue-600" />
                Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition font-medium disabled:opacity-50"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition disabled:opacity-50"
                    placeholder="e.g., Downtown Branch"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition disabled:opacity-50"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs font-medium text-gray-600 mb-1.5">
                    Name
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {form.name}
                  </p>
                </div>
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <FiPhone size={12} className="text-blue-600" />
                    Phone
                  </p>
                  <a
                    href={`tel:${form.phone}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    {form.phone || "Not provided"}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            Close
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={loading}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-60",
                loading
                  ? "bg-gray-300 text-gray-600 cursor-wait"
                  : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white",
              )}
            >
              {loading ? (
                <>
                  <FiLoader size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={16} />
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
