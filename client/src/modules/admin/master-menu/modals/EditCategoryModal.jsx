import { useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import {
  Save,
  Loader2,
  Tag,
  ListOrdered,
  CheckCircle2,
  X,
  Hash,
  Activity,
} from "lucide-react";
import clsx from "clsx";

export default function EditCategoryModal({ category, onClose, onSuccess }) {
  /* ================= STATE ================= */
  const [name, setName] = useState(category.name || "");
  const [sortOrder, setSortOrder] = useState(category.sortOrder || 0);
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!name.trim()) return toast.error("Category name required");

    try {
      setLoading(true);
      const apiConfig = masterMenuApi.updateCategory(category.id);

      await Axios({
        url: apiConfig.url,
        method: apiConfig.method,
        data: {
          name: name.trim(),
          sortOrder: Number(sortOrder),
        },
      });

      toast.success("Changes Synchronized");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Category Registry" onClose={onClose}>
      <div className="flex flex-col space-y-5 sm:space-y-7 py-1 px-0.5 animate-in fade-in zoom-in-95 duration-500 max-w-xl mx-auto selection:bg-emerald-100 max-h-[80vh] overflow-y-auto scrollbar-hide">
        {/* ================= IDENTITY BAR (Apple Glass Style) ================= */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-[22px] bg-white/40 backdrop-blur-md border border-white/20 shadow-sm ring-1 ring-black/[0.03]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[15px] bg-emerald-500 shadow-[0_8px_16px_-4px_rgba(16,185,129,0.3)] flex items-center justify-center text-white shrink-0">
              <Tag size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] sm:text-[16px] font-[800] text-slate-900 leading-tight truncate tracking-tight">
                {name || "Draft Entry"}
              </p>
              <div className="flex items-center gap-2 mt-0.5 opacity-60">
                <Hash size={10} className="text-slate-400" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter shrink-0">
                  REF-{category.id?.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-full shadow-sm border border-black/[0.03]">
            <Activity size={10} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-[900] text-slate-900 uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>

        {/* ================= INPUT GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
          {/* CATEGORY NAME */}
          <div className="sm:col-span-8 space-y-2">
            <label className="px-1 text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Primary Designation
            </label>
            <div className="relative group">
              <input
                autoFocus
                className="w-full h-12 sm:h-14 px-5 rounded-[18px] sm:rounded-[22px] bg-slate-100/50 border border-transparent outline-none focus:bg-white focus:ring-[6px] focus:ring-emerald-500/5 focus:border-emerald-500/10 transition-all duration-400 text-[15px] sm:text-[16px] font-[700] text-slate-900 shadow-inner placeholder:text-slate-300"
                placeholder="e.g. Signature Cocktails"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* SORT ORDER */}
          <div className="sm:col-span-4 space-y-2">
            <label className="px-1 text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Index
            </label>
            <div className="relative group">
              <input
                type="number"
                className="w-full h-12 sm:h-14 px-5 rounded-[18px] sm:rounded-[22px] bg-slate-100/50 border border-transparent outline-none focus:bg-white focus:ring-[6px] focus:ring-emerald-500/5 focus:border-emerald-500/10 transition-all duration-400 text-[15px] sm:text-[16px] font-[700] text-slate-900 shadow-inner text-center"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* HELPER BLOCK */}
        <div className="flex items-start gap-2 px-1">
          <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-relaxed italic">
            Placement logic: Lower index values appear at the top of the digital
            menu.
          </p>
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-black/[0.04]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 h-12 sm:h-14 rounded-[20px] sm:rounded-[24px] flex items-center justify-center gap-2 bg-slate-100 text-slate-500 font-bold text-[13px] hover:bg-white hover:text-red-500 hover:shadow-md transition-all active:scale-[0.96] border border-transparent"
          >
            <X size={16} strokeWidth={2.5} />
            Discard
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "w-full sm:flex-[2.5] h-12 sm:h-14 rounded-[20px] sm:rounded-[24px] flex items-center justify-center gap-2 transition-all duration-500 active:scale-[0.96]",
              "font-[900] text-[13px] uppercase tracking-widest text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]",
              loading ? "bg-slate-800" : "bg-black hover:bg-slate-900",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} strokeWidth={3} />
            ) : (
              <>
                <CheckCircle2
                  size={18}
                  strokeWidth={2.5}
                  className="text-emerald-400"
                />
                Synchronize Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
