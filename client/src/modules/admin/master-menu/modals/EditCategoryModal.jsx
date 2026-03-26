import { useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Save, Loader2, Tag, ListOrdered, X } from "lucide-react";
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
    <Modal title="Edit Category" onClose={onClose}>
      <div className="space-y-5 sm:space-y-6 max-w-xl mx-auto max-h-[76vh] sm:max-h-[78vh] overflow-y-auto pr-0.5">
        {/* CATEGORY NAME */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Tag size={16} className="text-[#FC8019]" />
            Category Name
          </label>
          <input
            autoFocus
            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400"
            placeholder="e.g. Appetizers"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* SORT ORDER */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ListOrdered size={16} className="text-[#FC8019]" />
            Display Order
          </label>
          <input
            type="number"
            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all duration-200 text-sm font-medium text-gray-900"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <p className="text-xs text-gray-500">Lower numbers appear first.</p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "w-full sm:flex-[1.5] h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 active:scale-[0.98]",
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
