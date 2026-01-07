// src/modules/manager/branch-menu/modals/UpdateStockModal.jsx

import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

/* ============================================================
   UPDATE STOCK MODAL
   ============================================================ */

export default function UpdateStockModal({ item, onClose, onSuccess }) {
  /* ✅ ALWAYS GET RESTAURANT ID FROM REDUX */
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [stock, setStock] = useState(
    item?.stock === null || item?.stock === undefined ? "" : String(item.stock)
  );

  const [loading, setLoading] = useState(false);

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!restaurantId) {
      toast.error("Restaurant not loaded");
      return false;
    }

    if (!item?._id) {
      toast.error("Invalid menu item");
      return false;
    }

    if (stock !== "" && Number(stock) < 0) {
      toast.error("Stock cannot be negative");
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
        ...branchMenuApi.updateStock(restaurantId, item._id),
        data: {
          stock:
            stock === "" || stock === null
              ? null // unlimited
              : Number(stock),
        },
      });

      toast.success("Stock updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("UpdateStockModal:", err);
      toast.error(err?.response?.data?.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <ModalShell title="Update Stock" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          Leave empty to allow unlimited orders.
        </p>

        <Input
          type="number"
          min={0}
          value={stock}
          placeholder="Enter stock quantity"
          onChange={(v) => setStock(v)}
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
          {loading ? "Saving..." : "Save Stock"}
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

function Input({ value, onChange, ...props }) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full h-11 px-3
        border rounded-lg text-sm
        focus:outline-none
        focus:ring-2 focus:ring-black
      "
    />
  );
}
