import { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Loader2, FolderPlus } from "lucide-react";

export default function CreateSubcategoryModal({
  categoryId,
  onClose,
  onSuccess, // 👈 parent callback
}) {
  /* ---------------- STATE ---------------- */

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- SUBMIT ---------------- */

  const submit = async () => {
    if (loading) return;

    if (!categoryId) {
      return toast.error("Category not selected");
    }

    if (!name.trim()) {
      return toast.error("Section name is required");
    }

    try {
      setLoading(true);

      await Axios({
        ...masterMenuApi.createSubcategory,
        data: {
          categoryId,
          name: name.trim(),
        },
      });

      toast.success("Section created successfully");

      // 🔥 CRITICAL: RESET TO ALL
      onSuccess("ALL");

      onClose();
    } catch (err) {
      console.error("CreateSubcategoryModal:", err);
      toast.error(err.response?.data?.message || "Failed to create section");
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
  });

  /* ---------------- UI ---------------- */

  return (
    <Modal title="Add Menu Section" onClose={onClose}>
      <div className="space-y-5 px-1">
        {/* HEADER */}
        <div className="flex items-center gap-2">
          <FolderPlus className="text-gray-400" size={20} />
          <p className="text-sm font-semibold text-gray-700">
            Create a new section under this category
          </p>
        </div>

        {/* INPUT */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">
            Section Name
          </label>
          <input
            autoFocus
            value={name}
            maxLength={40}
            placeholder="e.g. Veg Starters"
            onChange={(e) => setName(e.target.value)}
            className="
              w-full h-12 px-4 rounded-xl
              border bg-gray-50
              focus:ring-2 focus:ring-black
              outline-none
            "
          />
          <p className="text-[11px] text-gray-400">Max 40 characters</p>
        </div>

        {/* ACTION */}
        <button
          onClick={submit}
          disabled={loading}
          className="
            w-full h-12 rounded-xl
            bg-black text-white font-bold
            flex items-center justify-center gap-2
            disabled:opacity-60
            hover:bg-gray-900
            transition
          "
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creating…
            </>
          ) : (
            "Create Section"
          )}
        </button>
      </div>
    </Modal>
  );
}
