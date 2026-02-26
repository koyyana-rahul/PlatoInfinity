import { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Loader2, FolderPlus, CheckCircle2, X } from "lucide-react";
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
    <Modal title="Create Section" onClose={onClose}>
      <div className="space-y-5 max-w-xl mx-auto max-h-[75vh] overflow-y-auto">
        {/* SECTION NAME */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FolderPlus size={16} className="text-[#FC8019]" />
            Section Name
          </label>
          <input
            autoFocus
            maxLength={40}
            className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
            placeholder="e.g. Signature Starters"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">
              Use clear names for menu navigation.
            </p>
            <span
              className={clsx(
                "text-xs font-medium",
                name.length >= 35 ? "text-orange-500" : "text-gray-400",
              )}
            >
              {name.length}/40
            </span>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 h-11 rounded-lg flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading || !name.trim()}
            className={clsx(
              "w-full sm:flex-[1.5] h-11 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98]",
              loading || !name.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <CheckCircle2 size={16} />
                Create Section
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
