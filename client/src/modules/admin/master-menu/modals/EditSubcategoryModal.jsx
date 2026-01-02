import { useEffect, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Loader2, Edit3 } from "lucide-react";

export default function EditSubcategoryModal({
  subcategory,
  onClose,
  onSuccess,
}) {
  /* ---------------- STATE ---------------- */

  const [name, setName] = useState(subcategory?.name || "");
  const [loading, setLoading] = useState(false);

  const isUnchanged = name.trim() === subcategory?.name;

  /* ---------------- HANDLERS ---------------- */

  const submit = async () => {
    if (loading) return;

    if (!name.trim()) {
      return toast.error("Section name is required");
    }

    if (isUnchanged) {
      return toast("No changes to save", { icon: "ℹ️" });
    }

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
      console.error("EditSubcategoryModal:", err);
      toast.error(err.response?.data?.message || "Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- KEYBOARD UX ---------------- */

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* ---------------- UI ---------------- */

  return (
    <Modal title="Edit Menu Section" onClose={onClose}>
      <div className="space-y-5 px-1">
        {/* HEADER */}
        <div className="flex items-center gap-2">
          <Edit3 className="text-gray-400" size={18} />
          <p className="text-sm font-semibold text-gray-700">
            Update section details
          </p>
        </div>

        {/* INPUT */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">
            Section Name
          </label>
          <input
            autoFocus
            maxLength={40}
            value={name}
            placeholder="e.g. Veg Starters"
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border bg-gray-50
                       focus:ring-2 focus:ring-black outline-none"
          />
          <p className="text-[11px] text-gray-400">Max 40 characters</p>
        </div>

        {/* SAVE */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-black text-white font-bold
                     flex items-center justify-center gap-2
                     disabled:opacity-60 hover:bg-gray-900 transition"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </Modal>
  );
}
