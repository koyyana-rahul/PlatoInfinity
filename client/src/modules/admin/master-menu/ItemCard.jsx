import { useEffect, useRef, useState } from "react";
import EditItemModal from "./modals/EditItemModal";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function ItemCard({ item, onDelete, refresh }) {
  const [editOpen, setEditOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
        ? [item.image]
        : [];

  const price = item.price ?? item.basePrice ?? 0;

  useEffect(() => {
    setIndex(0);
  }, [item._id, item.id]);

  const prev = (e) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  };

  const next = (e) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setIndex((p) => (p === images.length - 1 ? 0 : p + 1));
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
    touchStartX.current = null;
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:scale-[1.02]">
        {/* IMAGE CONTAINER */}
        <div
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.length > 0 ? (
            <img
              key={images[index]}
              src={images[index]}
              alt={item.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              draggable={false}
              onError={(e) => {
                e.target.src = "https://placehold.co/400?text=Image+Error";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs font-medium text-gray-400">
              No Image
            </div>
          )}

          {/* VEG/NON-VEG INDICATOR */}
          <div className="absolute top-2 left-2 z-10">
            <div className="backdrop-blur-sm bg-white/90 p-1 rounded-md shadow-sm flex items-center justify-center">
              <VegNonVegIcon isVeg={item.isVeg} size={8} />
            </div>
          </div>

          {/* SLIDER CONTROLS */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40">
              <button
                onClick={prev}
                className="h-7 w-7 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 flex items-center justify-center shadow-lg pointer-events-auto active:scale-95 transition-transform hover:bg-white hover:scale-105"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={next}
                className="h-7 w-7 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 flex items-center justify-center shadow-lg pointer-events-auto active:scale-95 transition-transform hover:bg-white hover:scale-105"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* DOT INDICATORS */}
          {images.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-20">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-1 rounded-full transition-all",
                    i === index ? "w-3 bg-white" : "w-1 bg-white/40",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="px-1 pt-2.5 pb-1 space-y-2">
          <h4 className="font-semibold text-sm text-gray-900 leading-tight truncate">
            {item.name}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#FC8019]">
              ₹{Number(price).toFixed(2)}
            </span>

            {/* MOBILE ACTIONS */}
            <div className="lg:hidden flex gap-1">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 text-gray-400 active:text-green-600 active:bg-green-50 rounded-lg transition-colors"
              >
                <Pencil size={14} />
              </button>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 text-gray-400 active:text-red-600 active:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex-1 h-8 rounded-lg bg-green-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <Pencil size={13} strokeWidth={2.5} />
              Edit
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex-1 h-8 rounded-lg bg-red-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm"
              >
                <Trash2 size={13} strokeWidth={2.5} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {editOpen && (
        <EditItemModal
          item={item}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            refresh();
            setEditOpen(false);
          }}
        />
      )}
    </>
  );
}
