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
  Star,
} from "lucide-react";

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
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-gray-700">
              Item Images
            </label>
            <span className="text-[10px] font-bold text-gray-400">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-28 h-28 rounded-[22px] overflow-hidden border bg-gray-50 group snap-center"
              >
                <img
                  src={img.url || img.preview}
                  className="w-full h-full object-cover"
                  alt=""
                />
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                    Primary
                  </span>
                )}
                <button
                  onClick={() => removeImage(img, i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} strokeWidth={3} />
                </button>
                <button
                  onClick={() => reorder(i, 0)}
                  className="absolute bottom-1.5 left-1.5 right-1.5 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[8px] font-bold uppercase text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  Set Cover
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex-shrink-0 w-28 h-28 border-2 border-dashed rounded-[22px] flex flex-col items-center justify-center cursor-pointer text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                <Plus size={24} />
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
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Item Name
            </label>
            <input
              className="w-full bg-gray-100 rounded-[18px] px-4 py-3 text-sm font-bold border-none outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Base Price
            </label>
            <div className="flex bg-gray-100 rounded-[18px] overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
              <div className="w-10 flex items-center justify-center text-gray-400">
                <IndianRupee size={14} />
              </div>
              <input
                type="number"
                className="flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
              Kitchen Station
            </label>
            <div className="flex bg-gray-100 rounded-[18px] overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
              <div className="w-10 flex items-center justify-center text-gray-400">
                <Store size={14} />
              </div>
              <input
                className="flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none"
                value={form.defaultStation}
                onChange={(e) =>
                  setForm({ ...form, defaultStation: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Dietary Type
            </label>
            <div className="flex bg-gray-100 p-1 rounded-[18px]">
              <button
                onClick={() => setForm({ ...form, isVeg: true })}
                className={`flex-1 py-2 rounded-[14px] text-[10px] font-black uppercase transition-all ${form.isVeg ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400"}`}
              >
                <Leaf size={12} className="inline mr-1" /> Veg
              </button>
              <button
                onClick={() => setForm({ ...form, isVeg: false })}
                className={`flex-1 py-2 rounded-[14px] text-[10px] font-black uppercase transition-all ${!form.isVeg ? "bg-white text-red-600 shadow-sm" : "text-gray-400"}`}
              >
                <Flame size={12} className="inline mr-1" /> Non-Veg
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-1">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full bg-gray-100 rounded-[18px] px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* ================= ACTION BAR ================= */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-[20px] py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-[2] bg-black text-white rounded-[20px] py-4 text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
