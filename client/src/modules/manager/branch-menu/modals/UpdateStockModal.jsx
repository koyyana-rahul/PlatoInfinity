import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X, Minus, Plus } from "lucide-react";
import clsx from "clsx";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

export default function UpdateStockModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const [stockQty, setStockQty] = useState(
    item.stockQty === null || item.stockQty === undefined ? "" : item.stockQty,
  );
  const [loading, setLoading] = useState(false);

  const isUnlimited = stockQty === "";

  const adjustStock = (amt) => {
    const current = Number(stockQty) || 0;
    const next = Math.max(0, current + amt);
    setStockQty(next);
  };

  const submit = async () => {
    try {
      setLoading(true);
      await Axios({
        ...branchMenuApi.updateStock(restaurantId, item._id),
        data: {
          stockQty: stockQty === "" ? null : Number(stockQty),
        },
      });

      toast.success("Inventory updated");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Stock update failed");
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
            <h3 className="text-xl font-bold text-gray-900">Update Stock</h3>
            <p className="text-sm text-gray-600 mt-1 truncate">{item.name}</p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
            <button
              onClick={() => adjustStock(-1)}
              disabled={isUnlimited}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>

            <input
              type="number"
              min="0"
              value={stockQty}
              disabled={isUnlimited}
              onChange={(e) => setStockQty(e.target.value)}
              className="w-full max-w-[160px] text-center text-xl font-semibold text-gray-900 border border-gray-300 rounded-lg py-2 disabled:bg-gray-100"
              placeholder="0"
            />

            <button
              onClick={() => adjustStock(1)}
              disabled={isUnlimited}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => setStockQty(isUnlimited ? "0" : "")}
            className={clsx(
              "w-full h-10 rounded-lg border text-sm font-semibold",
              isUnlimited
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-white border-gray-300 text-gray-700",
            )}
          >
            {isUnlimited ? "Switch to Manual Count" : "Set Unlimited Stock"}
          </button>

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
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
