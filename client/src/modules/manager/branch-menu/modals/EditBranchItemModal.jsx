// src/modules/manager/branch-menu/modals/EditBranchItemModal.jsx

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";
import kitchenStationApi from "../../../../api/kitchenStation.api";

/* ============================================================
   EDIT BRANCH MENU ITEM MODAL
   ============================================================ */

export default function EditBranchItemModal({ item, onClose, onSuccess }) {
  /* ================= GLOBAL ================= */
  const restaurantId = useSelector((s) => s.user.restaurantId);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price ?? 0,
    station: item?.station || "",
    status: item?.status || "ON",
  });

  /* ================= KITCHEN STATIONS ================= */
  const [stations, setStations] = useState([]);
  const [stationLoading, setStationLoading] = useState(true);

  /* ================= UI ================= */
  const [loading, setLoading] = useState(false);

  /* ================= LOAD STATIONS ================= */
  useEffect(() => {
    const loadStations = async () => {
      if (!restaurantId) return;

      try {
        setStationLoading(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch (err) {
        console.error("loadStations:", err);
        toast.error("Failed to load kitchen stations");
      } finally {
        setStationLoading(false);
      }
    };

    loadStations();
  }, [restaurantId]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!restaurantId) {
      toast.error("Restaurant not loaded");
      return false;
    }

    if (!item?._id) {
      toast.error("Invalid item");
      return false;
    }

    if (!form.name.trim()) {
      toast.error("Item name is required");
      return false;
    }

    if (Number(form.price) < 0) {
      toast.error("Price cannot be negative");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!validate() || loading) return;

    try {
      setLoading(true);

      await Axios({
        ...branchMenuApi.updateItem(restaurantId, item._id),
        data: {
          name: form.name.trim(),
          price: Number(form.price),
          station: form.station || null,
          status: form.status,
        },
      });

      toast.success("Item updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("EditBranchItemModal:", err);
      toast.error(err?.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <ModalShell title="Edit Menu Item" onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="Item Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <Input
          label="Price (₹)"
          type="number"
          min={0}
          value={form.price}
          onChange={(v) => setForm({ ...form, price: v })}
        />

        {/* ================= KITCHEN STATION ================= */}
        <Select
          label="Kitchen Station"
          value={form.station || ""}
          onChange={(v) => setForm({ ...form, station: v })}
          disabled={stationLoading}
          options={[
            { value: "", label: stationLoading ? "Loading..." : "No Station" },
            ...stations.map((s) => ({
              value: s.name,
              label: s.name,
            })),
          ]}
        />

        <Select
          label="Availability"
          value={form.status}
          onChange={(v) => setForm({ ...form, status: v })}
          options={[
            { value: "ON", label: "Available" },
            { value: "OFF", label: "Unavailable" },
          ]}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="
            w-full h-11
            bg-black text-white
            rounded-lg text-sm font-semibold
            hover:bg-gray-900
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   UI HELPERS
   ============================================================ */

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={16} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full h-11 mt-1 px-3
          border rounded-lg text-sm
          focus:outline-none
          focus:ring-2 focus:ring-black
        "
      />
    </div>
  );
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full h-11 mt-1 px-3
          border rounded-lg text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-black
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
