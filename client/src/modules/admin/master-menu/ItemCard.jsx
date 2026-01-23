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
      <div className="group relative bg-white rounded-[24px] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
        {/* IMAGE CONTAINER */}
        <div
          className="relative aspect-square rounded-[18px] overflow-hidden bg-[#F2F2F7]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.length > 0 ? (
            <img
              key={images[index]}
              src={images[index]}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              draggable={false}
              onError={(e) => {
                e.target.src = "https://placehold.co/400?text=Image+Error";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              No Image
            </div>
          )}

          {/* STANDARD FOOD INDICATOR (Using your VegNonVegIcon) */}
          <div className="absolute top-2 left-2 z-30">
            <div className="backdrop-blur-md bg-white/80 p-1 rounded-md shadow-sm border border-white/40 flex items-center justify-center">
              <VegNonVegIcon isVeg={item.isVeg} size={8} />
            </div>
          </div>

          {/* SLIDER CONTROLS */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                onClick={prev}
                className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-md text-black flex items-center justify-center shadow-sm pointer-events-auto active:scale-90 transition-transform"
              >
                <ChevronLeft size={14} strokeWidth={3} />
              </button>
              <button
                onClick={next}
                className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-md text-black flex items-center justify-center shadow-sm pointer-events-auto active:scale-90 transition-transform"
              >
                <ChevronRight size={14} strokeWidth={3} />
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
                    "h-1 rounded-full transition-all duration-300",
                    i === index ? "w-3 bg-white" : "w-1 bg-white/40",
                  )}
                />
              ))}
            </div>
          )}

          {/* DESKTOP ACTIONS */}
          <div className="absolute inset-0 bg-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:flex items-center justify-center gap-3 z-30">
            <button
              onClick={() => setEditOpen(true)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-lg shadow-xl flex items-center justify-center text-slate-700 hover:text-emerald-500 hover:scale-110 transition-all active:scale-95"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={onDelete}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-lg shadow-xl flex items-center justify-center text-slate-700 hover:text-red-500 hover:scale-110 transition-all active:scale-95"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* INFO SECTION */}
        <div className="px-1 pt-2.5 pb-1 space-y-0.5">
          <h4 className="font-bold text-[13px] text-slate-900 leading-tight truncate tracking-tight">
            {item.name}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[900] text-black tracking-tight">
              ₹{Number(price).toFixed(2)}
            </span>

            {/* MOBILE ACTIONS */}
            <div className="lg:hidden flex gap-1">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 text-slate-400 active:text-emerald-500 active:bg-emerald-50 rounded-lg transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-slate-400 active:text-red-500 active:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
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
