import { useState } from "react";
import toast from "react-hot-toast";
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

      toast.success("Kitchen station created");
      onSuccess(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to create station");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Kitchen Station
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Grill, Tandoor"
          className="w-full h-11 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="text-sm text-gray-600">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? "Saving…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
