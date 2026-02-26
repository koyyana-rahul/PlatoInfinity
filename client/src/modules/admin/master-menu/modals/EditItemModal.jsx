import { useRef, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import {
  Loader2,
  Leaf,
  Flame,
  IndianRupee,
  Store,
  X,
  Plus,
  Save,
} from "lucide-react";
import clsx from "clsx";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const isTouchDevice =
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export default function EditItemModal({ item, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    basePrice: item?.basePrice ?? "",
    isVeg: item?.isVeg ?? true,
    defaultStation: item?.defaultStation || "",
  });

  const [images, setImages] = useState(
    item?.images?.map((url) => ({ type: "existing", url })) || [],
  );
  const [removedImages, setRemovedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const reorder = (from, to) => {
    if (from === to) return;
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  const handleNewImages = (files) => {
    const selected = Array.from(files);
    if (images.length + selected.length > MAX_IMAGES)
      return toast.error(`Max ${MAX_IMAGES} images allowed`);

    const valid = selected
      .filter(
        (file) =>
          file.type.startsWith("image/") &&
          file.size <= MAX_SIZE_MB * 1024 * 1024,
      )
      .map((file) => ({
        type: "new",
        file,
        preview: URL.createObjectURL(file),
      }));

    setImages((p) => [...p, ...valid]);
  };

  const removeImage = (img, index) => {
    if (img.type === "existing") setRemovedImages((p) => [...p, img.url]);
    setImages((p) => p.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Item name required");
    if (!images.length) return toast.error("Add at least one image");
    try {
      setLoading(true);
      const fd = new FormData();
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        removedImages,
        existingImagesOrder: images
          .filter((img) => img.type === "existing")
          .map((img) => img.url),
      };
      fd.append("data", JSON.stringify(payload));
      images.forEach((img) => {
        if (img.type === "new") fd.append("images", img.file);
      });
      await Axios({ ...masterMenuApi.updateItem(item._id), data: fd });
      toast.success("Item updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Menu Item" onClose={onClose}>
      <div className="space-y-8">
        {/* ================= IMAGES ================= */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Item Images
            </label>
            <span className="text-xs font-medium text-gray-500">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group snap-center"
              >
                <img
                  src={img.url || img.preview}
                  className="w-full h-full object-cover"
                  alt=""
                />
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-[#FC8019] text-white text-[8px] font-bold px-2 py-1 rounded-md">
                    Primary
                  </span>
                )}
                <button
                  onClick={() => removeImage(img, i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => reorder(i, 0)}
                  className="absolute bottom-1.5 left-1.5 right-1.5 py-1 bg-[#FC8019] rounded-md text-[8px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  Set Cover
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-[#FC8019] hover:bg-orange-50 hover:border-[#FC8019] transition-all">
                <Plus size={20} />
                <input
                  hidden
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleNewImages(e.target.files)}
                />
              </label>
            )}
          </div>
        </section>

        {/* ================= FORM ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Item Name
            </label>
            <input
              className="w-full h-11 bg-gray-50 rounded-lg px-4 text-sm font-medium border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Base Price
            </label>
            <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[#FC8019]/40 focus-within:border-[#FC8019] transition-all">
              <div className="w-10 flex items-center justify-center text-gray-400">
                <IndianRupee size={14} />
              </div>
              <input
                type="number"
                className="flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Kitchen Station
            </label>
            <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[#FC8019]/40 focus-within:border-[#FC8019] transition-all">
              <div className="w-10 flex items-center justify-center text-gray-400">
                <Store size={14} />
              </div>
              <input
                className="flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none"
                value={form.defaultStation}
                onChange={(e) =>
                  setForm({ ...form, defaultStation: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Dietary Type
            </label>
            <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
              <button
                onClick={() => setForm({ ...form, isVeg: true })}
                className={clsx(
                  "flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1",
                  form.isVeg
                    ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                <Leaf size={14} /> Veg
              </button>
              <button
                onClick={() => setForm({ ...form, isVeg: false })}
                className={clsx(
                  "flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1",
                  !form.isVeg
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                <Flame size={14} /> Non-Veg
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full h-20 bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "flex-1 h-11 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2",
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
