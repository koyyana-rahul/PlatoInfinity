import { useState } from "react";
import toast from "react-hot-toast";
import { X, DownloadCloud } from "lucide-react";
import Axios from "../../../../api/axios";

export default function ImportFromMasterModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await Axios.post(`/api/branch-menu/${restaurantId}/import`, {
        importAll: true,
        masterItemIds: [],
      });
      toast.success("Menu imported successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
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

        <div className="p-6 sm:p-7">
          <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <DownloadCloud size={22} />
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Import from Master Menu
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            This will import all master menu items for this branch.
          </p>

          <div className="mt-6 flex gap-3">
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
              {loading ? "Importing..." : "Import All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
