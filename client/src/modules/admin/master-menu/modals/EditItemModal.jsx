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

/* ================= CONFIG ================= */

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const isTouchDevice =
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

/* ================= COMPONENT ================= */

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

  /* ================= DRAG REFS ================= */

  const dragIndex = useRef(null);
  const touchIndex = useRef(null);

  /* ================= HELPERS ================= */

  const reorder = (from, to) => {
    if (from === to) return;

    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

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

  const onDragStart = (index) => {
    dragIndex.current = index;
  };

  const onDrop = (index) => {
    if (dragIndex.current === null) return;
    reorder(dragIndex.current, index);
    dragIndex.current = null;
  };

  /* ================= MOBILE TOUCH DRAG ================= */

  const onTouchStart = (index) => {
    touchIndex.current = index;
  };

  const onTouchMove = (e) => {
    if (touchIndex.current === null) return;

    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const wrapper = el?.closest("[data-index]");
    if (!wrapper) return;

    const newIndex = Number(wrapper.dataset.index);
    if (newIndex !== touchIndex.current) {
      reorder(touchIndex.current, newIndex);
      touchIndex.current = newIndex;
    }
  };

  const onTouchEnd = () => {
    touchIndex.current = null;
  };

  /* ================= PRIMARY IMAGE ================= */

  const setPrimary = (index) => reorder(index, 0);

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Item name required");
    if (!images.length) return toast.error("Add at least one image");

    try {
      setLoading(true);

      const existingImagesOrder = images
        .filter((img) => img.type === "existing")
        .map((img) => img.url);

      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        removedImages,
        existingImagesOrder,
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
    } catch (err) {
      console.error(err);
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
        <section>
          <label className="text-sm font-semibold text-gray-700">
            Item Images
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Drag to reorder • First image is primary
          </p>

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                data-index={i}
                draggable={!isTouchDevice}
                onDragStart={!isTouchDevice ? () => onDragStart(i) : undefined}
                onDragOver={
                  !isTouchDevice ? (e) => e.preventDefault() : undefined
                }
                onDrop={!isTouchDevice ? () => onDrop(i) : undefined}
                onTouchStart={isTouchDevice ? () => onTouchStart(i) : undefined}
                onTouchMove={isTouchDevice ? onTouchMove : undefined}
                onTouchEnd={isTouchDevice ? onTouchEnd : undefined}
                className="relative rounded-xl overflow-hidden border bg-gray-100"
              >
                <img
                  src={img.url || img.preview}
                  className="w-full h-24 object-cover"
                  alt=""
                />

                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                    <Star size={10} className="inline mr-1 text-yellow-400" />
                    Primary
                  </span>
                )}

                <div className="absolute bottom-1 right-1 flex gap-1">
                  <button
                    onClick={() => setPrimary(i)}
                    className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center text-yellow-500"
                  >
                    <Star size={14} />
                  </button>

                  <button
                    onClick={() => removeImage(img, i)}
                    className="h-7 w-7 bg-white/90 rounded-full flex items-center justify-center text-red-600"
                  >
                    <X size={14} />
                  </button>

                  {!isTouchDevice && (
                    <div
                      className="
                        h-7 w-7 bg-white/90 rounded-full flex items-center
                        justify-center text-gray-500 cursor-grab touch-none
                      "
                    >
                      <GripVertical size={14} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400">
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
        <section className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Item Name</label>
            <input
              className="w-full border rounded-xl px-4 py-3 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Base Price</label>
            <div className="flex border rounded-xl overflow-hidden">
              <div className="w-10 flex items-center justify-center border-r">
                <IndianRupee size={16} />
              </div>
              <input
                type="number"
                className="flex-1 px-3 py-3 text-sm"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Kitchen Station</label>
            <div className="flex border rounded-xl overflow-hidden">
              <div className="w-10 flex items-center justify-center border-r">
                <Store size={16} />
              </div>
              <input
                className="flex-1 px-3 py-3 text-sm"
                value={form.defaultStation}
                onChange={(e) =>
                  setForm({ ...form, defaultStation: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Description</label>
            <textarea
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm"
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
          <div className="grid grid-cols-2 border rounded-xl mt-2 overflow-hidden">
            <button
              onClick={() => setForm({ ...form, isVeg: true })}
              className={`py-3 font-semibold ${
                form.isVeg ? "bg-green-600 text-white" : "bg-gray-100"
              }`}
            >
              <Leaf size={14} className="inline mr-1" /> Veg
            </button>
            <button
              onClick={() => setForm({ ...form, isVeg: false })}
              className={`py-3 font-semibold ${
                !form.isVeg ? "bg-red-600 text-white" : "bg-gray-100"
              }`}
            >
              <Flame size={14} className="inline mr-1" /> Non-Veg
            </button>
          </div>
        </section>

        {/* ================= ACTION BAR ================= */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-3 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-black text-white rounded-xl py-3 font-semibold"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
