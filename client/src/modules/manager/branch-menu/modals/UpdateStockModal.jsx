// src/modules/manager/branch-menu/modals/UpdateStockModal.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X, Package, Infinity, Plus, Minus, Save } from "lucide-react";
import clsx from "clsx";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

export default function UpdateStockModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  // Use local state for the numeric value
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      {/* 1. GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. CENTERED MODAL CARD */}
      <div className="relative w-full max-w-[380px] bg-white rounded-[42px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-10 flex flex-col items-center text-center">
          {/* ICON AREA */}
          <div className="relative mb-6 pt-2">
            <div className="absolute inset-0 bg-emerald-500/15 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[28px] flex items-center justify-center">
              <Package size={36} strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            Update Stock
          </h3>
          <p className="mt-2 text-[12px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-full">
            {item.name}
          </p>

          {/* MAIN COUNTER INTERFACE */}
          <div className="mt-8 w-full space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-[24px] border border-slate-100">
              <button
                onClick={() => adjustStock(-1)}
                disabled={isUnlimited}
                className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-red-500 shadow-sm active:scale-90 disabled:opacity-30 transition-all"
              >
                <Minus size={20} />
              </button>

              <div className="flex-1 flex flex-col items-center">
                {isUnlimited ? (
                  <Infinity
                    size={32}
                    className="text-emerald-500 animate-pulse"
                  />
                ) : (
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-transparent text-center text-3xl font-black text-slate-900 focus:outline-none"
                    placeholder="0"
                  />
                )}
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                  Quantity
                </span>
              </div>

              <button
                onClick={() => adjustStock(1)}
                disabled={isUnlimited}
                className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-emerald-500 shadow-sm active:scale-90 disabled:opacity-30 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* UNLIMITED TOGGLE PILL */}
            <button
              onClick={() => setStockQty(isUnlimited ? "0" : "")}
              className={clsx(
                "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border",
                isUnlimited
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50",
              )}
            >
              {isUnlimited
                ? "Switch to Manual Count"
                : "Set to Unlimited Stock"}
            </button>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={submit}
            disabled={loading}
            className="
              mt-8 w-full h-14 bg-slate-900 text-white 
              rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] 
              shadow-xl active:scale-95 transition-all 
              flex items-center justify-center gap-3
              disabled:opacity-50 hover:bg-emerald-600 group
            "
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Confirm Stock
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
