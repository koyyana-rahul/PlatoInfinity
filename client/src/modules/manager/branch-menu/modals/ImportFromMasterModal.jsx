// src/modules/manager/branch-menu/modals/ImportFromMasterModal.jsx

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

export default function ImportFromMasterModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [importAll, setImportAll] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      await Axios.post(`/api/branch-menu/${restaurantId}/import`, {
        importAll: true, // OR false
        masterItemIds: [], // REQUIRED if importAll=false
      });

      toast.success("Menu imported successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        {/* HEADER */}
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">Import From Master Menu</h3>
          <button onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Import menu items from the master menu into this branch. Existing
            items will not be duplicated.
          </p>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={importAll}
              onChange={(e) => setImportAll(e.target.checked)}
              className="accent-black"
            />
            Import all master menu items
          </label>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold"
          >
            {loading ? "Importing..." : "Import Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
