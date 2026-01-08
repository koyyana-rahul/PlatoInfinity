// src/pages/restaurants/components/CreateRestaurantModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import IndiaAddressForm from "../../../components/address/IndiaAddressForm";

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

  const submit = async () => {
    const { name, phone, address } = form;

    // Validation
    if (!name.trim()) return toast.error("Restaurant name is required");
    if (!address.state) return toast.error("Please select a state");
    if (!address.district) return toast.error("Please select a district");
    if (address.pincode?.length !== 6)
      return toast.error("Valid 6-digit pincode is required");

    // Constructing a clean address text for search/display
    const addressText = [
      address.village,
      address.mandal,
      address.district,
      address.state,
      address.pincode,
    ]
      .filter((val) => val && val.trim() !== "") // Remove empty fields
      .join(", ");

    try {
      setLoading(true);
      await Axios.post("/api/restaurants", {
        name: name.trim(),
        phone: phone?.trim(),
        address, // Structured for Meta
        addressText, // Flattened for display
      });

      toast.success("Restaurant created successfully 🎉");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create restaurant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">New Restaurant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Restaurant Name *
              </label>
              <input
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Paradise Biryani"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Phone Number
              </label>
              <input
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
              />
            </div>
          </div>

          <hr />

          {/* Address Section */}
          <IndiaAddressForm
            value={form.address}
            onChange={(address) => setForm({ ...form, address })}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
}