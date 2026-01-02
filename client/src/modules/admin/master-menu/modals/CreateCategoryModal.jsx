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
      <div className="space-y-6">
        {/* INFO TEXT */}
        <p className="text-xs text-gray-400 leading-relaxed">
          Categories appear at the top of the master menu and help customers
          quickly browse food sections (e.g. Starters, Main Course, Desserts).
        </p>

        {/* INPUT */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Category Name
          </label>

          <div className="relative">
            <LayoutGrid
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starters"
              className="
                w-full
                pl-12 pr-4 py-4
                rounded-2xl
                bg-gray-50
                border-2 border-transparent
                font-bold
                text-sm
                outline-none
                transition
                focus:bg-white
                focus:border-red-500
              "
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              w-full sm:w-1/2
              py-3
              rounded-xl
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
              hover:text-gray-600
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="
              w-full sm:w-1/2
              py-3
              rounded-xl
              bg-black
              text-white
              font-black
              uppercase
              tracking-widest
              flex items-center justify-center gap-2
              transition
              hover:bg-red-600
              disabled:opacity-60
            "
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
