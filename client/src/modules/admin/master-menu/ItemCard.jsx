import { useState } from "react";
import EditItemModal from "./modals/EditItemModal";
import Axios from "../../../api/axios";
import masterMenuApi from "../../../api/masterMenu.api";
import toast from "react-hot-toast";
import { Pencil, Trash2, Leaf, Flame } from "lucide-react";

export default function ItemCard({ item, refresh }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------------- NORMALIZE DATA ---------------- */

  const price = item.price ?? item.basePrice ?? 0;

  /* ---------------- DELETE ---------------- */

  const remove = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const api = masterMenuApi.deleteItem(item._id);
      await Axios({ url: api.url, method: api.method });
      toast.success("Item archived");
      refresh?.();
    } catch (err) {
      console.error("Delete item:", err);
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition relative">
        {/* IMAGE */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform md:group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              No Image
            </div>
          )}

          {/* VEG / NON-VEG BADGE */}
          <div className="absolute top-2 left-2 bg-white p-1 rounded-md shadow">
            {item.isVeg ? (
              <Leaf size={14} className="text-green-600" />
            ) : (
              <Flame size={14} className="text-red-600" />
            )}
          </div>

          {/* DESKTOP HOVER ACTIONS */}
          <div
            className="
              absolute inset-0 bg-black/30
              hidden md:flex
              opacity-0 md:group-hover:opacity-100
              items-center justify-center gap-3
              transition
            "
          >
            <button
              onClick={() => setEditOpen(true)}
              className="bg-white p-2 rounded-full hover:scale-110 transition"
              aria-label="Edit item"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={remove}
              disabled={deleting}
              className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition disabled:opacity-50"
              aria-label="Delete item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-3 space-y-1">
          <h4 className="font-bold text-sm truncate">{item.name}</h4>

          <p className="text-xs text-gray-500">₹{Number(price).toFixed(2)}</p>

          {item.defaultStation && (
            <p className="text-[10px] text-gray-400 truncate">
              {item.defaultStation}
            </p>
          )}
        </div>

        {/* MOBILE ACTIONS */}
        <div className="mt-3 flex gap-2 md:hidden">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 py-2 rounded-xl border text-xs font-bold hover:bg-gray-50 transition"
          >
            Edit
          </button>

          <button
            onClick={remove}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl border text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <EditItemModal
          item={item}
          onClose={() => setEditOpen(false)}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
