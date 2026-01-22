import { useState } from "react";
import toast from "react-hot-toast";
import { X, ChefHat, Sparkles, LayoutPanelTop, Hash } from "lucide-react";
import clsx from "clsx";
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

      toast.success("Station created!");
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to create station");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      {/* GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* MODAL CONTAINER: Responsive width and rounded corners */}
      <div className="relative w-full max-w-[360px] bg-white rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* CLOSE ICON: Smaller on mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-slate-50 text-slate-400 active:scale-90 transition-all"
        >
          <X size={18} />
        </button>

        {/* CONTENT: Reduced padding on mobile (p-6 vs p-12) */}
        <div className="p-6 sm:p-12 flex flex-col items-center text-center">
          {/* ICON: Scaled down for mobile */}
          <div className="relative mb-4 sm:mb-8">
            <div className="absolute inset-0 bg-emerald-500/15 blur-2xl rounded-full" />
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-emerald-50 text-emerald-600 rounded-[24px] sm:rounded-[34px] flex items-center justify-center">
              <LayoutPanelTop size={32} className="sm:hidden" />
              <LayoutPanelTop size={48} className="hidden sm:block" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            New Station
          </h3>
          <p className="mt-2 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500 px-2">
            Add a prep area for your kitchen.
          </p>

          {/* INPUT: Shorter height on mobile (h-12 vs h-16) */}
          <div className="mt-6 sm:mt-10 w-full relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
              <Hash size={16} />
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grill, Bar"
              className="w-full h-12 sm:h-16 bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* BUTTON: Optimized height for mobile */}
          <button
            onClick={submit}
            disabled={loading}
            className="
              mt-4 sm:mt-8 w-full h-12 sm:h-16 bg-slate-900 text-white 
              rounded-2xl sm:rounded-[28px] text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] 
              active:scale-95 transition-all flex items-center justify-center gap-3
              hover:bg-emerald-600
            "
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                Create Station
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="mt-4 sm:mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
