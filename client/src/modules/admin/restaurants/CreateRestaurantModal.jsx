import { useState } from "react";
import {
  FiX,
  FiPlus,
  FiLoader,
  FiInfo,
  FiGlobe,
  FiMapPin,
  FiLayers,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import IndiaAddressForm from "../../../components/address/IndiaAddressForm";
import clsx from "clsx";

/**
 * CreateRestaurantModal
 * Pattern: Middle-Centered floating modal for both Mobile and Desktop
 */
export default function CreateRestaurantModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: {
      state: "",
      district: "",
      mandal: "",
      village: "",
      pincode: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleAddressChange = (updatedAddress) => {
    setForm((prev) => ({ ...prev, address: updatedAddress }));
  };

  const submit = async () => {
    const { name, phone, address } = form;

    if (!name.trim()) return toast.error("Entity name is required");
    if (!address.state || !address.district)
      return toast.error("Complete geographical data required");
    if (address.pincode?.length !== 6)
      return toast.error("Valid 6-digit Pincode required");

    const addressText = [
      address.village,
      address.mandal,
      address.district,
      address.state,
      address.pincode,
    ]
      .filter((val) => val?.trim())
      .join(", ");

    try {
      setLoading(true);
      await Axios.post("/api/restaurants", {
        name: name.trim(),
        phone: phone?.trim(),
        address,
        addressText,
      });

      toast.success("New branch successfully established");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Protocol Failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-xl flex items-center justify-center shadow-md">
              <FiLayers size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Add New Restaurant
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Create a new restaurant location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* IDENTITY SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FiInfo className="text-[#FC8019]" size={16} />
              <p className="text-sm font-semibold text-gray-700">
                Restaurant Details
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  Restaurant Name *
                </label>
                <input
                  autoFocus
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter restaurant name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-[#FC8019]" size={16} />
              <p className="text-sm font-semibold text-gray-700">
                Location Information
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200">
              <IndiaAddressForm
                value={form.address}
                onChange={handleAddressChange}
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              loading
                ? "bg-gray-300 text-gray-600"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white",
            )}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiPlus size={16} strokeWidth={2.5} />
                <span>Create Restaurant</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
