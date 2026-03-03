import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";
import kitchenStationApi from "../../../../api/kitchenStation.api";

export default function EditBranchItemModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price ?? 0,
    station: item?.station || "",
    status: item?.status || "ON",
  });
  const [stations, setStations] = useState([]);
  const [stationLoading, setStationLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStations = async () => {
      if (!restaurantId) return;
      try {
        setStationLoading(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch {
        toast.error("Failed to load kitchen stations");
      } finally {
        setStationLoading(false);
      }
    };
    loadStations();
  }, [restaurantId]);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Item name is required");
    if (Number(form.price) < 0) return toast.error("Price cannot be negative");

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
      toast.error(err?.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Menu Item</h3>
            <p className="text-sm text-gray-600 mt-1">
              Update name, price, station and status.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Item Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Price
            </label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kitchen Station
            </label>
            <select
              value={form.station}
              disabled={stationLoading}
              onChange={(e) =>
                setForm((p) => ({ ...p, station: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">No Specific Station</option>
              {stations.map((s) => (
                <option key={s._id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
