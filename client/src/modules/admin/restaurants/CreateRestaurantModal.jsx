import { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";

const DEFAULT_FORM = {
  name: "",
  phone: "",
  timezone: "Asia/Kolkata",
  address: {
    line1: "",
    city: "",
    state: "",
    pincode: "",
  },
};

export default function CreateRestaurantModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Restaurant name is required");
      return false;
    }
    if (!form.address.city || !form.address.state) {
      toast.error("City and State are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await Axios({
        ...restaurantApi.create,
        data: form,
      });

      toast.success("Restaurant created");
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold">Create Restaurant</h2>
            <p className="text-sm text-gray-600">
              Add a new branch under your brand
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <input
            className="input"
            placeholder="Restaurant name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="input"
            placeholder="Address line"
            value={form.address.line1}
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, line1: e.target.value },
              })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              className="input"
              placeholder="City *"
              value={form.address.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, city: e.target.value },
                })
              }
            />
            <input
              className="input"
              placeholder="State *"
              value={form.address.state}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, state: e.target.value },
                })
              }
            />
            <input
              className="input"
              placeholder="Pincode"
              value={form.address.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, pincode: e.target.value },
                })
              }
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-[#00684A] text-white px-5 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
}
