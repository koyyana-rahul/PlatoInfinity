// src/modules/manager/branch-menu/modals/SyncWithMasterModal.jsx

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

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

      toast.success("Menu synced with master successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to sync with master menu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        {/* HEADER */}
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Sync With Master Menu</h3>
          <button onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Sync branch menu items with the latest changes from the master menu.
          </p>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="mt-1 accent-black"
            />
            <span>
              <strong>Overwrite local changes</strong>
              <br />
              <span className="text-gray-500 text-xs">
                This will replace price, name, and station with master values.
              </span>
            </span>
          </label>

          <button
            onClick={sync}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold"
          >
            {loading ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
