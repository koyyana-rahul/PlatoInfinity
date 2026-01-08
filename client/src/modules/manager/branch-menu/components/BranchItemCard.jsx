import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Package,
} from "lucide-react";

import VegNonVegIcon from "../../../../components/ui/VegNonVegIcon";
import EditBranchItemModal from "../modals/EditBranchItemModal";
import UpdateStockModal from "../modals/UpdateStockModal";

export default function BranchItemCard({ item, onDelete, refresh, onSync }) {
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

  /* ---------------- IMAGES ---------------- */
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

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
    touchStartX.current = null;
  };

  /* ---------------- STATUS LOGIC ---------------- */
  const price = item.price ?? 0;
  const isOff = item.status === "OFF";

  const stockQty = item.stockQty;
  const isUnlimited = item.trackStock && stockQty === null;
  const isOutOfStock =
    item.trackStock && stockQty === 0 && item.autoHideWhenZero;

  const stockLabel = !item.trackStock
    ? "No stock tracking"
    : isUnlimited
    ? "Unlimited"
    : `${stockQty} left`;

  return (
    <>
      <div
        className={`
          group bg-white rounded-xl p-3 shadow-sm
          hover:shadow-md transition
          ${isOff ? "opacity-60 grayscale-[0.2]" : ""}
        `}
      >
        {/* ================= IMAGE ================= */}
        <div
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.length ? (
            <img
              src={images[index]}
              alt={item.name}
              className="w-full h-full object-cover transition lg:group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              No image
            </div>
          )}

          {/* SLIDER */}
          {images.length > 1 && (
            <>
              <IconBtn left onClick={prev}>
                <ChevronLeft size={14} />
              </IconBtn>
              <IconBtn right onClick={next}>
                <ChevronRight size={14} />
              </IconBtn>
            </>
          )}

          {/* DOTS */}
          {images.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === index ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* VEG / NON-VEG */}
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-black/30 backdrop-blur rounded-sm p-0.5">
              <VegNonVegIcon isVeg={item.masterItemId?.isVeg} size={10} />
            </div>
          </div>

          {/* STATUS */}
          <StatusBadge isOff={isOff} />

          {/* OUT OF STOCK */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-sm font-bold text-red-600">
              OUT OF STOCK
            </div>
          )}

          {/* DESKTOP ACTIONS */}
          <div
            className="absolute inset-0 bg-black/30 hidden lg:flex
                          opacity-0 group-hover:opacity-100
                          items-center justify-center gap-4 transition"
          >
            <ActionBtn onClick={() => setEditOpen(true)}>
              <Pencil size={16} />
            </ActionBtn>

            <ActionBtn danger onClick={onDelete}>
              <Trash2 size={16} />
            </ActionBtn>

            <ActionBtn info onClick={onSync} title="Sync with master">
              <RefreshCcw size={16} />
            </ActionBtn>
          </div>
        </div>

        {/* ================= INFO ================= */}
        <div className="mt-3 space-y-1">
          <h4 className="text-sm font-semibold truncate">{item.name}</h4>

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">
              ₹{Number(price).toFixed(2)}
            </p>

            {/* STOCK */}
            {item.trackStock && (
              <button
                onClick={() => setStockOpen(true)}
                className="
                  flex items-center gap-1
                  text-xs font-medium
                  px-2 py-0.5 rounded-full
                  bg-gray-100 hover:bg-gray-200
                "
              >
                <Package size={12} />
                {stockLabel}
              </button>
            )}
          </div>
        </div>

        {/* MOBILE ACTIONS */}
        <div className="mt-3 flex gap-2 lg:hidden">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 py-2 rounded-lg border text-xs font-medium"
          >
            Edit
          </button>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {editOpen && (
        <EditBranchItemModal
          item={item}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            refresh();
            setEditOpen(false);
          }}
        />
      )}

      {stockOpen && (
        <UpdateStockModal
          item={item}
          onClose={() => setStockOpen(false)}
          onSuccess={() => {
            refresh();
            setStockOpen(false);
          }}
        />
      )}
    </>
  );
}

/* ================= SMALL UI PARTS ================= */

function IconBtn({ children, onClick, left, right }) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute top-1/2 -translate-y-1/2
        ${left ? "left-2" : "right-2"}
        h-7 w-7 rounded-full
        bg-black/50 text-white
        flex items-center justify-center
      `}
    >
      {children}
    </button>
  );
}

function ActionBtn({ children, onClick, danger, info }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-white p-2 rounded-full
        hover:scale-110 transition
        ${danger ? "text-red-600" : ""}
        ${info ? "text-blue-600" : ""}
      `}
    >
      {children}
    </button>
  );
}

function StatusBadge({ isOff }) {
  return (
    <div
      className={`
        absolute top-2 right-2 text-[10px]
        px-2 py-0.5 rounded-full font-semibold
        ${isOff ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}
      `}
    >
      {isOff ? "OFF" : "ON"}
    </div>
  );
}
