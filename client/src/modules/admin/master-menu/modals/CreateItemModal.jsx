import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Leaf,
  Flame,
  IndianRupee,
  Store,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";

import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";

const MAX_IMAGES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreateItemModal({
  categoryId,
  subcategoryId = null,
  onClose,
  onSuccess,
}) {
  /* ================= STATE ================= */

  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    isVeg: true,
    defaultStation: "",
  });

  const [images, setImages] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // string[]
  const [loading, setLoading] = useState(false);

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  /* ================= IMAGE HANDLING ================= */

  const handleImageSelect = (files) => {
    const incoming = Array.from(files || []);

    if (images.length + incoming.length > MAX_IMAGES) {
      return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }

    const valid = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error("Each image must be under 5MB");
        continue;
      }
      valid.push(file);
    }

    const updated = [...images, ...valid];
    setImages(updated);
    setPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImages((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (loading) return;

    if (!categoryId) return toast.error("Category not selected");
    if (!form.name.trim()) return toast.error("Item name is required");
    if (form.basePrice === "" || Number(form.basePrice) < 0) {
      return toast.error("Enter a valid price");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        basePrice: Number(form.basePrice),
        isVeg: Boolean(form.isVeg),
        categoryId,
        ...(subcategoryId && { subcategoryId }),
        ...(form.defaultStation && {
          defaultStation: form.defaultStation.trim(),
        }),
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      images.forEach((img) => fd.append("images", img));

      await Axios({
        ...masterMenuApi.createItem,
        data: fd,
      });

      toast.success("Menu item created");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("CreateItemModal:", err);
      toast.error(err.response?.data?.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal title="Add Menu Item" onClose={onClose}>
      <div className="space-y-7">
        {/* ================= IMAGES ================= */}
        <section className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Item Images
          </label>

          <div
            onClick={() =>
              document.getElementById("create-item-images-input").click()
            }
            className="
              border-2 border-dashed
              rounded-xl
              p-4
              cursor-pointer
              hover:bg-gray-50
              transition
            "
          >
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden group"
                >
                  <img
                    src={src}
                    className="w-full h-20 object-cover"
                    alt="Preview"
                  />

                  {/* DARK OVERLAY */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />

                  {/* REMOVE */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="
                      absolute top-1 right-1
                      h-7 w-7
                      rounded-full
                      bg-white/90
                      text-red-600
                      flex items-center justify-center
                      shadow
                    "
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {previews.length < MAX_IMAGES && (
                <div className="h-20 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={18} />
                  <span className="text-[11px]">Add</span>
                </div>
              )}
            </div>
          </div>

          <input
            id="create-item-images-input"
            hidden
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageSelect(e.target.files)}
          />

          <p className="text-[11px] text-gray-400">
            Up to {MAX_IMAGES} images • First image shown to customers
          </p>
        </section>

        {/* ================= FORM ================= */}
        <section className="space-y-5">
          {/* ITEM NAME */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Item Name
            </label>
            <input
              className="w-full border rounded-xl px-4 py-3 text-sm"
              placeholder="e.g. Butter Chicken"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm resize-none"
              placeholder="Short description shown to customers"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          {/* PRICE */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Base Price
            </label>
            <div className="flex border rounded-xl overflow-hidden">
              <div className="w-11 flex items-center justify-center border-r text-gray-400">
                <IndianRupee size={16} />
              </div>
              <input
                type="number"
                min="0"
                className="flex-1 px-3 py-3 text-sm outline-none"
                placeholder="199"
                value={form.basePrice}
                onChange={(e) =>
                  setForm((p) => ({ ...p, basePrice: e.target.value }))
                }
              />
            </div>
          </div>

          {/* KITCHEN STATION */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Kitchen Station
            </label>
            <div className="flex border rounded-xl overflow-hidden">
              <div className="w-11 flex items-center justify-center border-r text-gray-400">
                <Store size={16} />
              </div>
              <input
                className="flex-1 px-3 py-3 text-sm outline-none"
                placeholder="Tandoor / Fryer"
                value={form.defaultStation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, defaultStation: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        {/* ================= DIET ================= */}
        <section className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Dietary Type
          </label>

          <div className="grid grid-cols-2 border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isVeg: true }))}
              className={`h-12 font-semibold flex items-center justify-center gap-2
                ${
                  form.isVeg
                    ? "bg-green-600 text-white"
                    : "bg-gray-50 text-gray-600"
                }`}
            >
              <Leaf size={16} /> Veg
            </button>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isVeg: false }))}
              className={`h-12 font-semibold flex items-center justify-center gap-2
                ${
                  !form.isVeg
                    ? "bg-red-600 text-white"
                    : "bg-gray-50 text-gray-600"
                }`}
            >
              <Flame size={16} /> Non-Veg
            </button>
          </div>
        </section>

        {/* ================= SAVE ================= */}
        <button
          onClick={submit}
          disabled={loading}
          className="
            w-full h-12
            rounded-xl
            bg-black text-white
            font-semibold
            flex items-center justify-center gap-2
            disabled:opacity-60
          "
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creating…
            </>
          ) : (
            "Create Menu Item"
          )}
        </button>
      </div>
    </Modal>
  );
}
