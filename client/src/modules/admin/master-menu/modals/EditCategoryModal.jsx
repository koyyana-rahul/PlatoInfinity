import { useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Save, Loader2, Tag, ListOrdered } from "lucide-react";

export default function EditCategoryModal({ category, onClose, onSuccess }) {
  const [name, setName] = useState(category.name || "");
  const [sortOrder, setSortOrder] = useState(category.sortOrder || 0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

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

      toast.success("Category updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Category" onClose={onClose}>
      <div className="space-y-6">
        {/* CATEGORY NAME */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Tag size={12} /> Category Name
          </label>
          <input
            autoFocus
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none font-bold transition"
            placeholder="e.g. Starters, Main Course"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* SORT ORDER */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <ListOrdered size={12} /> Display Order
          </label>
          <input
            type="number"
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none font-bold transition"
            placeholder="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <p className="text-[10px] text-gray-400 italic">
            Lower number appears first in menu
          </p>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
