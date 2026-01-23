import { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Loader2, FolderPlus, CheckCircle2, X, Type, Hash } from "lucide-react";
import clsx from "clsx";

export default function CreateSubcategoryModal({
  categoryId,
  onClose,
  onSuccess,
}) {
  /* ---------------- STATE ---------------- */
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    if (loading) return;
    if (!categoryId) return toast.error("Parent category not found");
    if (!name.trim()) return toast.error("Section name is required");

    try {
      setLoading(true);
      await Axios({
        ...masterMenuApi.createSubcategory,
        data: {
          categoryId,
          name: name.trim(),
        },
      });

      toast.success("Section Synced Successfully");
      onSuccess("ALL");
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to initialize section",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- KEYBOARD UX ---------------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [name, loading]);

  return (
    <Modal title="Section Registry" onClose={onClose}>
      {/* CONTAINER DYNAMICS:
          - space-y-5 to space-y-7 for responsive verticality.
          - max-h-[75vh] ensures it fits on small Android screens without clipping.
      */}
      <div className="flex flex-col space-y-5 sm:space-y-7 py-1 px-0.5 animate-in fade-in zoom-in-95 duration-500 max-w-xl mx-auto selection:bg-emerald-100 max-h-[75vh] overflow-y-auto scrollbar-hide">
        {/* ================= IDENTITY BAR (Apple Glass Style) ================= */}
        <div className="flex items-center justify-between p-3.5 rounded-[22px] bg-[#F2F2F7] border border-black/[0.03] shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[15px] bg-white shadow-sm flex items-center justify-center text-emerald-500 border border-black/[0.02]">
              <FolderPlus size={18} sm:size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] sm:text-[16px] font-[800] text-slate-900 leading-tight truncate tracking-tight">
                {name || "Draft Section"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                <Hash size={10} className="text-slate-400" />
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                  REGISTRY MODE
                </span>
              </div>
            </div>
          </div>
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full shadow-sm border border-black/[0.03]">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-[900] text-slate-900 uppercase tracking-widest">
              Active
            </span>
          </div>
        </div>

        {/* ================= INPUT FIELD ================= */}
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <label className="text-[10px] font-[900] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Type size={12} className="text-emerald-500" /> Designation
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
            <input
              autoFocus
              maxLength={40}
              className="w-full h-12 sm:h-14 px-5 rounded-[18px] sm:rounded-[22px] bg-slate-100/50 border border-transparent outline-none focus:bg-white focus:ring-[6px] focus:ring-emerald-500/5 focus:border-emerald-500/10 transition-all duration-400 text-[15px] sm:text-[16px] font-[700] text-slate-900 shadow-inner placeholder:text-slate-300"
              placeholder="e.g. Signature Starters"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <p className="px-2 text-[10px] text-slate-400 font-medium italic">
            * Use clear names for better customer menu navigation.
          </p>
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-black/[0.04]">
          {/* DISCARD / CANCEL */}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 h-12 sm:h-14 rounded-[20px] sm:rounded-[24px] flex items-center justify-center gap-2 bg-slate-100 text-slate-500 font-bold text-[13px] hover:bg-white hover:text-red-500 hover:shadow-md transition-all active:scale-[0.96] border border-transparent"
          >
            <X size={16} strokeWidth={2.5} />
            Discard
          </button>

          {/* INITIALIZE / CREATE */}
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
                Initialize Section
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
