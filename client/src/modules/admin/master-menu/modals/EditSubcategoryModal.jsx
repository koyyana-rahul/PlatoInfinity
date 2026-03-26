import { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Loader2, Type, ArrowRight, X, Save } from "lucide-react";
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
    <Modal title="Edit Section" onClose={onClose}>
      <div className="space-y-5 sm:space-y-6 max-w-xl mx-auto max-h-[76vh] sm:max-h-[78vh] overflow-y-auto pr-0.5">
        {/* VISUAL CHANGE TRACKER */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
          <div className="text-xs">
            <span className="font-semibold text-gray-500 block mb-1">
              Current
            </span>
            <p className="font-medium text-gray-700 truncate max-w-[100px]">
              {subcategory?.name}
            </p>
          </div>
          <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <ArrowRight
              size={14}
              className="text-[#FC8019]"
              strokeWidth={2.5}
            />
          </div>
          <div className="text-xs text-right">
            <span className="font-semibold text-[#FC8019] block mb-1">New</span>
            <p className="font-medium text-gray-900 truncate max-w-[100px]">
              {name || "..."}
            </p>
          </div>
        </div>

        {/* SECTION NAME INPUT */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Type size={16} className="text-[#FC8019]" />
            New Name
          </label>
          <input
            autoFocus
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400"
            placeholder="Enter new name..."
          />
          <div className="flex justify-between">
            <p className="text-xs text-gray-500"></p>
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
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading || isUnchanged}
            className={clsx(
              "w-full sm:flex-[1.5] h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 active:scale-[0.98]",
              loading || isUnchanged
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Save size={16} />
                Update
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
