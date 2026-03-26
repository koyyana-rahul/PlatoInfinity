import { useState } from "react";
import { Loader2, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";

/**
 * CREATE CATEGORY MODAL
 * --------------------
 * Brand admin creates a top-level master menu category
 */
export default function CreateCategoryModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------- HANDLERS -------------------- */

  const submit = async () => {
    const trimmed = name.trim();

    if (!trimmed) {
      return toast.error("Category name is required");
    }

    try {
      setLoading(true);

      await Axios({
        ...masterMenuApi.createCategory,
        data: { name: trimmed },
      });

      toast.success("Category created successfully");
      onSuccess(); // refresh menu tree
      onClose(); // close modal
    } catch (err) {
      console.error("CreateCategory error:", err);
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <Modal title="Add Category" onClose={onClose}>
      <div className="space-y-5 sm:space-y-6">
        {/* INFO TEXT */}
        <p className="text-sm text-gray-600 leading-relaxed">
          Categories appear at the top of the master menu and help customers
          quickly browse food sections (e.g. Starters, Main Course, Desserts).
        </p>

        {/* INPUT */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Category Name
          </label>

          <div className="relative">
            <LayoutGrid
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-300 font-medium text-sm outline-none transition-all duration-200 focus:bg-white focus:border-[#FC8019] focus:ring-2 focus:ring-orange-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-1/2 h-11 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full sm:w-1/2 h-11 rounded-xl bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving
              </>
            ) : (
              "Create Category"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
