import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Package,
  Layers,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import VegNonVegIcon from "../../../../components/ui/VegNonVegIcon";
import clsx from "clsx";

export default function BranchItemCard({ item, refresh, onEdit, onStock }) {
  const images =
    item.images?.length > 0 ? item.images : item.image ? [item.image] : [];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => setIndex(0), [item._id]);

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  /* ---------------- STATUS LOGIC ---------------- */
  const isOff = item.status === "OFF";
  const stockQty = item.stockQty;
  const isUnlimited = item.trackStock && stockQty === null;
  const isLowStock = item.trackStock && stockQty > 0 && stockQty <= 5;
  const isOutOfStock = item.trackStock && stockQty === 0;

  return (
    <div
      className={clsx(
        "group relative bg-white border border-gray-200 rounded-xl p-3 transition-all duration-300 shadow-sm hover:shadow-md",
        isOff && "opacity-80",
      )}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
        {images.length ? (
          <img
            src={images[index]}
            alt={item.name}
            className={clsx(
              "w-full h-full object-cover transition-all duration-500 lg:group-hover:scale-105",
              isOff && "grayscale brightness-90",
            )}
            draggable={false}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const diff =
                e.changedTouches[0].clientX - (touchStartX.current || 0);
              if (Math.abs(diff) > 50) diff > 0 ? prev() : next();
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-400">
            <Layers className="mb-2" size={28} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              No Image
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-20 pointer-events-none">
          <div className="bg-white/95 p-1.5 rounded-md border border-gray-200 pointer-events-auto">
            <VegNonVegIcon isVeg={item.masterItemId?.isVeg} size={14} />
          </div>

          <div
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-full border pointer-events-auto",
              isOff
                ? "bg-gray-100 border-gray-300 text-gray-500"
                : "bg-green-50 border-green-200 text-green-700",
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                isOff ? "bg-gray-500" : "bg-green-600",
              )}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {isOff ? "Hidden" : "Live"}
            </span>
          </div>
        </div>

        {/* SLIDER CONTROLS */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
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

        {/* DOTS */}
        {images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        )}

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col h-full">
        <div className="flex justify-between items-start gap-2 min-h-[52px]">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-[15px] font-semibold text-gray-900 leading-tight truncate">
              {item.name}
            </h4>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mt-1">
              {item.category?.name || "General"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg font-bold text-orange-600 tracking-tight">
              ₹{Number(item.price || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {item.trackStock && (
            <button
              onClick={() => onStock?.(item)}
              className={clsx(
                "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all border",
                isOutOfStock
                  ? "bg-gray-100 text-gray-500 border-gray-200"
                  : isLowStock
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-green-50 text-green-700 border-green-200",
              )}
            >
              <Boxes size={12} />
              {isUnlimited ? "Unlimited Stock" : `${stockQty} Remaining`}
            </button>
          )}

          <button
            onClick={() => onEdit?.(item)}
            className="w-full h-11 flex items-center justify-center gap-2 bg-orange-500 text-white rounded-lg text-sm font-semibold transition-all hover:bg-orange-600"
          >
            <Pencil size={14} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              Edit Details
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
