import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import Axios from "../../../api/axios";
import kitchenStationApi from "../../../api/kitchenStation.api";

export default function CreateKitchenStationModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Station name required");
      return;
    }

    try {
      setLoading(true);
      const res = await Axios({
        ...kitchenStationApi.create(restaurantId),
        data: { name },
      });

      toast.success("Station created");
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to create station");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Add Kitchen Station
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Create a station like Grill, Fryer, or Bar.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Station Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grill, Bar"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="pt-1 flex gap-3">
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
              {loading ? "Creating..." : "Create Station"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
