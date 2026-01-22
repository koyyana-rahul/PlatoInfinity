import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Package,
  Layers,
} from "lucide-react";

import VegNonVegIcon from "../../../../components/ui/VegNonVegIcon";
import EditBranchItemModal from "../modals/EditBranchItemModal";
import UpdateStockModal from "../modals/UpdateStockModal";
import clsx from "clsx";

export default function BranchItemCard({ item, onDelete, refresh, onSync }) {
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

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
    <>
      <div
        className={clsx(
          "group relative bg-white border border-slate-200 rounded-[28px] p-3 transition-all duration-500 active:scale-[0.98] shadow-sm hover:shadow-xl hover:border-emerald-100",
          isOff && "bg-slate-50/80 shadow-none border-slate-100",
        )}
      >
        {/* ================= IMAGE SECTION ================= */}
        <div className="relative aspect-square rounded-[20px] overflow-hidden bg-slate-100 shadow-inner">
          {images.length ? (
            <img
              src={images[index]}
              alt={item.name}
              className={clsx(
                "w-full h-full object-cover transition-all duration-700 lg:group-hover:scale-110",
                isOff && "grayscale brightness-75 opacity-60",
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
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-300">
              <Layers className="mb-2 opacity-20" size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                No Image
              </span>
            </div>
          )}

          {/* BADGES LAYER */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-20 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-100/50 pointer-events-auto">
              <VegNonVegIcon isVeg={item.masterItemId?.isVeg} size={14} />
            </div>

            <div
              className={clsx(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border-2 backdrop-blur-md pointer-events-auto",
                isOff
                  ? "bg-slate-900/90 border-slate-700 text-slate-400"
                  : "bg-white border-emerald-500 text-emerald-600",
              )}
            >
              <span
                className={clsx(
                  "w-2 h-2 rounded-full",
                  isOff
                    ? "bg-slate-600"
                    : "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isOff ? "Hidden" : "Live"}
              </span>
            </div>
          </div>

          {/* DOTS */}
          {images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-4 bg-white" : "w-1.5 bg-white/40",
                  )}
                />
              ))}
            </div>
          )}

          {/* OUT OF STOCK */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                Sold Out
              </span>
            </div>
          )}

          {/* DESKTOP HOVER */}
          <div className="absolute inset-0 bg-black/20 hidden lg:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <NavBtn onClick={onSync}>
              <RefreshCcw size={16} />
            </NavBtn>
            <NavBtn onClick={onDelete} danger>
              <Trash2 size={16} />
            </NavBtn>
          </div>
        </div>

        {/* ================= INFO SECTION ================= */}
        <div className="mt-4 flex flex-col h-full">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-black text-slate-800 leading-tight truncate">
                {item.name}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                {item.category?.name || "General"}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-lg font-black text-emerald-600 tracking-tighter">
                ₹{Number(item.price || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ACTION BAR: Now Responsive and Contained */}
          <div className="mt-4 space-y-2">
            {/* Stock Button (Full width if present to prevent layout break) */}
            {item.trackStock && (
              <button
                onClick={() => setStockOpen(true)}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                  isOutOfStock
                    ? "bg-slate-100 text-slate-400 border-slate-200"
                    : isLowStock
                      ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100",
                )}
              >
                <Package size={12} />
                {isUnlimited ? "Unlimited Stock" : `${stockQty} Remaining`}
              </button>
            )}

            {/* Edit Button: Primary Action */}
            <button
              onClick={() => setEditOpen(true)}
              className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-[18px] shadow-lg shadow-emerald-500/20 active:scale-[0.96] transition-all hover:bg-emerald-600"
            >
              <Pencil size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                Edit Details
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
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

function NavBtn({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-10 w-10 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-75",
        danger
          ? "bg-red-500 text-white"
          : "bg-white text-slate-900 hover:text-emerald-500",
      )}
    >
      {children}
    </button>
  );
}
