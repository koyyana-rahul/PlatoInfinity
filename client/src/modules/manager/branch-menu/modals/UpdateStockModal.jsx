// src/modules/manager/branch-menu/modals/UpdateStockModal.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

export default function UpdateStockModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  // null = unlimited
  const [stockQty, setStockQty] = useState(
    item.stockQty === null || item.stockQty === undefined ? "" : item.stockQty
  );

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      await Axios({
        ...branchMenuApi.updateStock(restaurantId, item._id),
        data: {
          stockQty: stockQty === "" ? null : Number(stockQty),
        },
      });

      toast.success("Stock updated");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("UpdateStockModal:", err);
      toast.error(err?.response?.data?.message || "Stock update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Update Stock" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-gray-500">Leave empty for unlimited stock</p>

        <input
          type="number"
          min={0}
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
          placeholder="Stock quantity"
          className="w-full h-11 px-3 border rounded-lg text-sm"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="
            w-full h-11
            bg-black text-white
            rounded-lg text-sm font-semibold
            disabled:opacity-60
          "
        >
          {loading ? "Saving..." : "Save Stock"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ================= MODAL SHELL ================= */

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">
        <header className="px-5 py-4 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
