import { useState } from "react";
import toast from "react-hot-toast";
import { X, RefreshCcw } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

export default function SyncWithMasterModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    try {
      setLoading(true);
      await Axios({
        ...branchMenuApi.syncWithMaster(restaurantId),
        data: { overwrite },
      });
      toast.success("Menu synchronized with master");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sync failed");
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
            <RefreshCcw size={22} />
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Sync with Master Menu
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Pull latest changes from master menu for this branch.
          </p>

          <label className="mt-5 flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Overwrite local changes
              </p>
              <p className="text-xs text-gray-500">
                Replace local edits with master values.
              </p>
            </div>
          </label>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={sync}
              disabled={loading}
              className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
