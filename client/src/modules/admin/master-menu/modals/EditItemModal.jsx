import { useRef, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import toast from "react-hot-toast";
import {
  Save,
  Loader2,
  Leaf,
  Flame,
  IndianRupee,
  Store,
  X,
  Plus,
  GripVertical,
  Star,
} from "lucide-react";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

// ✅ Mobile detection (PRODUCTION SAFE)
const isTouchDevice =
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export default function EditItemModal({ item, onClose, onSuccess }) {
  /* ================= STATE ================= */

  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    basePrice: item?.basePrice ?? "",
    isVeg: item?.isVeg ?? true,
    defaultStation: item?.defaultStation || "",
  });

  const [images, setImages] = useState(
    item?.images?.map((url) => ({ type: "existing", url })) || []
  );

  const [removedImages, setRemovedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const dragIndex = useRef(null);

  /* ================= IMAGE ADD ================= */

  const handleNewImages = (files) => {
    const selected = Array.from(files);

    if (images.length + selected.length > MAX_IMAGES) {
      return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }

    const valid = [];

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Each image must be under ${MAX_SIZE_MB}MB`);
        return;
      }

      valid.push({
        type: "new",
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((p) => [...p, ...valid]);
  };

  /* ================= IMAGE REMOVE ================= */

  const removeImage = (img, index) => {
    if (img.type === "existing") {
      setRemovedImages((p) => [...p, img.url]);
    }
    setImages((p) => p.filter((_, i) => i !== index));
  };

  /* ================= DESKTOP DRAG ================= */

  const onDragStart = (i) => (dragIndex.current = i);

  const onDrop = (i) => {
    if (dragIndex.current === null) return;

    const arr = [...images];
    const moved = arr.splice(dragIndex.current, 1)[0];
    arr.splice(i, 0, moved);
    dragIndex.current = null;
    setImages(arr);
  };

  /* ================= MOBILE MOVE ================= */

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return;

    const arr = [...images];
    const [img] = arr.splice(from, 1);
    arr.splice(to, 0, img);
    setImages(arr);
  };

  /* ================= PRIMARY ================= */

  const setPrimary = (index) => {
    const arr = [...images];
    const [img] = arr.splice(index, 1);
    arr.unshift(img);
    setImages(arr);
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Item name required");
    if (Number(form.basePrice) < 0) return toast.error("Invalid price");
    if (!images.length) return toast.error("Add at least one image");

    try {
      setLoading(true);

      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        removedImages,
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      images.forEach((img) => {
        if (img.type === "new") fd.append("images", img.file);
      });

      await Axios({
        ...masterMenuApi.updateItem(item._id),
        data: fd,
      });

      toast.success("Item updated");
      onSuccess();
      onClose();
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal title="Edit Menu Item" onClose={onClose}>
      <div className="space-y-8">

        {/* ================= IMAGES ================= */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">
              Item Images
            </label>
            <span className="text-xs text-gray-400">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Drag on desktop • Use arrows on mobile • First image is primary
          </p>

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                draggable={!isTouchDevice}
                onDragStart={!isTouchDevice ? () => onDragStart(i) : undefined}
                onDragOver={!isTouchDevice ? (e) => e.preventDefault() : undefined}
                onDrop={!isTouchDevice ? () => onDrop(i) : undefined}
                className="relative rounded-xl overflow-hidden border bg-gray-100 group"
              >
                <img
                  src={img.url || img.preview}
                  className="w-full h-24 object-cover"
                  alt="Item"
                />

                {/* PRIMARY */}
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                    <Star size={10} className="inline mr-1 text-yellow-400" />
                    Primary
                  </span>
                )}

                {/* ACTIONS */}
                <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                  <button
                    onClick={() => setPrimary(i)}
                    className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center text-yellow-500 shadow"
                  >
                    <Star size={14} />
                  </button>

                  <button
                    onClick={() => removeImage(img, i)}
                    className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center text-red-600 shadow"
                  >
                    <X size={14} />
                  </button>

                  {!isTouchDevice && (
                    <div className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center text-gray-500 shadow cursor-grab">
                      <GripVertical size={14} />
                    </div>
                  )}
                </div>

                {/* MOBILE MOVE */}
                {isTouchDevice && (
                  <div className="absolute top-1.5 right-1.5 flex gap-1">
                    <button
                      onClick={() => moveImage(i, i - 1)}
                      disabled={i === 0}
                      className="h-6 w-6 bg-white/90 rounded-full text-xs disabled:opacity-30"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => moveImage(i, i + 1)}
                      disabled={i === images.length - 1}
                      className="h-6 w-6 bg-white/90 rounded-full text-xs disabled:opacity-30"
                    >
                      ▶
                    </button>
                  </div>
                )}
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:bg-gray-50">
                <Plus size={18} />
                <span className="text-xs">Add</span>
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
        <section className="space-y-5">

          {/* NAME */}
          <div>
            <label className="text-sm font-semibold">Item Name</label>
            <input
              className="w-full border rounded-xl px-4 py-3 text-sm"
              placeholder="Butter Chicken"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="text-sm font-semibold">Base Price</label>
            <div className="flex border rounded-xl overflow-hidden">
              <div className="w-11 flex items-center justify-center border-r text-gray-400">
                <IndianRupee size={16} />
              </div>
              <input
                type="number"
                className="flex-1 px-3 py-3 text-sm outline-none"
                placeholder="199"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
              />
            </div>
          </div>

          {/* STATION */}
          <div>
            <label className="text-sm font-semibold">Kitchen Station</label>
            <div className="flex border rounded-xl overflow-hidden">
              <div className="w-11 flex items-center justify-center border-r text-gray-400">
                <Store size={16} />
              </div>
              <input
                className="flex-1 px-3 py-3 text-sm outline-none"
                placeholder="Tandoor / Fryer"
                value={form.defaultStation}
                onChange={(e) =>
                  setForm({ ...form, defaultStation: e.target.value })
                }
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-semibold">Description</label>
            <textarea
              rows={4}
              className="w-full border rounded-xl px-4 py-3 text-sm resize-none"
              placeholder="Optional description shown to customers"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </section>

        {/* ================= DIET ================= */}
        <section>
          <label className="text-sm font-semibold">Dietary Type</label>
          <div className="grid grid-cols-2 border rounded-xl overflow-hidden mt-2">
            <button
              onClick={() => setForm({ ...form, isVeg: true })}
              className={`py-3 font-semibold ${
                form.isVeg ? "bg-green-600 text-white" : "bg-gray-100"
              }`}
            >
              <Leaf size={16} className="inline mr-1" /> Veg
            </button>
            <button
              onClick={() => setForm({ ...form, isVeg: false })}
              className={`py-3 font-semibold ${
                !form.isVeg ? "bg-red-600 text-white" : "bg-gray-100"
              }`}
            >
              <Flame size={16} className="inline mr-1" /> Non-Veg
            </button>
          </div>
        </section>

        {/* ================= ACTION BAR ================= */}
        <div className="sticky bottom-0 bg-white border-t pt-3 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border rounded-xl py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-black text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving…
              </>
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