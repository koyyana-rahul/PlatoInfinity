import { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Loader2, Type, ArrowRight, X } from "lucide-react";
import clsx from "clsx";

export default function EditSubcategoryModal({
  subcategory,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState(subcategory?.name || "");
  const [loading, setLoading] = useState(false);

  const isUnchanged = name.trim() === subcategory?.name;

  const submit = async () => {
    if (loading) return;
    if (!name.trim()) return toast.error("Section name is required");
    if (isUnchanged) return toast("No changes to save", { icon: "ℹ️" });

    try {
      setLoading(true);
      await Axios({
        ...masterMenuApi.updateSubcategory(subcategory.id),
        data: { name: name.trim() },
      });

      toast.success("Section updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [name, loading]);

  return (
    <Modal title="Rename Section" onClose={onClose}>
      <div className="space-y-7 px-1 py-1 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {/* VISUAL HIERARCHY - THE "CHANGE" TRACKER */}
        <div className="flex items-center justify-between p-4 rounded-[26px] bg-[#FBFBFC] border border-black/[0.04]">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Original
            </span>
            <p className="text-[13px] font-bold text-slate-400 truncate max-w-[120px]">
              {subcategory?.name}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ArrowRight
              size={14}
              className="text-emerald-500"
              strokeWidth={3}
            />
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              New
            </span>
            <p className="text-[13px] font-bold text-slate-900 truncate max-w-[120px]">
              {name || "..."}
            </p>
          </div>
        </div>

        {/* ELEGANT INPUT - "Floating Glass" Look */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <label className="text-[11px] font-[800] text-slate-500 uppercase tracking-widest">
              Section Identity
            </label>
            <span
              className={clsx(
                "text-[9px] font-bold transition-colors",
                name.length >= 35 ? "text-orange-500" : "text-slate-300",
              )}
            >
              {name.length}/40
            </span>
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <Type size={18} strokeWidth={2.5} />
            </div>
            <input
              autoFocus
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={clsx(
                "w-full h-16 pl-14 pr-6 rounded-[24px] bg-white border border-black/[0.06] transition-all duration-300 outline-none",
                "text-[16px] font-bold text-black placeholder:text-slate-200 shadow-sm",
                "focus:border-emerald-500/20 focus:ring-[6px] focus:ring-emerald-500/5 focus:shadow-md",
              )}
              placeholder="Enter new name..."
            />
          </div>
        </div>

        {/* APPLE ACTIONS - "Bottom Heavy" layout */}
        <div className="flex flex-col gap-3">
          <button
            onClick={submit}
            disabled={loading || isUnchanged}
            className={clsx(
              "w-full h-16 rounded-[24px] font-[900] text-[14px] transition-all duration-500 flex items-center justify-center gap-2",
              "shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)]",
              loading
                ? "bg-slate-100 text-slate-400"
                : isUnchanged
                  ? "bg-slate-50 text-slate-200 opacity-50 cursor-not-allowed shadow-none"
                  : "bg-black text-white hover:scale-[1.02] active:scale-95 active:bg-slate-900",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} strokeWidth={3} />
            ) : (
              "Confirm & Update"
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full h-12 flex items-center justify-center gap-2 text-[12px] font-bold text-slate-400 hover:text-black transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
