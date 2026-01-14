// import { useEffect, useRef, useState } from "react";
// import EditItemModal from "./modals/EditItemModal";
// import {
//   Pencil,
//   Trash2,
//   Leaf,
//   Flame,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// export default function ItemCard({ item, onDelete, refresh }) {
//   const [editOpen, setEditOpen] = useState(false);

//   const images =
//     item.images?.length > 0 ? item.images : item.image ? [item.image] : [];

//   const [index, setIndex] = useState(0);
//   const touchStartX = useRef(null);

//   const price = item.price ?? item.basePrice ?? 0;

//   /* ---------------- RESET ON ITEM CHANGE ---------------- */
//   useEffect(() => {
//     setIndex(0);
//   }, [item._id]);

//   /* ---------------- NAVIGATION ---------------- */

//   const prev = (e) => {
//     e?.stopPropagation();
//     setIndex((p) => (p === 0 ? images.length - 1 : p - 1));
//   };

//   const next = (e) => {
//     e?.stopPropagation();
//     setIndex((p) => (p === images.length - 1 ? 0 : p + 1));
//   };

//   /* ---------------- TOUCH SWIPE ---------------- */

//   const onTouchStart = (e) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const onTouchEnd = (e) => {
//     if (touchStartX.current === null) return;
//     const diff = e.changedTouches[0].clientX - touchStartX.current;
//     if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
//     touchStartX.current = null;
//   };

//   return (
//     <>
//       <div className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition relative">
//         {/* IMAGE CAROUSEL */}
//         <div
//           className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
//           onTouchStart={onTouchStart}
//           onTouchEnd={onTouchEnd}
//         >
//           {images.length ? (
//             <img
//               src={images[index]}
//               alt={item.name}
//               className="w-full h-full object-cover transition-transform duration-300 lg:group-hover:scale-105"
//               draggable={false}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-xs text-gray-400">
//               No Image
//             </div>
//           )}

//           {/* CAROUSEL CONTROLS (ALL SCREENS) */}
//           {images.length > 1 && (
//             <>
//               <button
//                 onClick={prev}
//                 className="
//                   absolute left-1 sm:left-2 top-1/2 -translate-y-1/2
//                   h-7 w-7 sm:h-8 sm:w-8
//                   rounded-full bg-black/50 text-white
//                   flex items-center justify-center
//                   opacity-100 lg:opacity-0 lg:group-hover:opacity-100
//                   transition z-30
//                 "
//               >
//                 <ChevronLeft size={16} />
//               </button>

//               <button
//                 onClick={next}
//                 className="
//                   absolute right-1 sm:right-2 top-1/2 -translate-y-1/2
//                   h-7 w-7 sm:h-8 sm:w-8
//                   rounded-full bg-black/50 text-white
//                   flex items-center justify-center
//                   opacity-100 lg:opacity-0 lg:group-hover:opacity-100
//                   transition z-30
//                 "
//               >
//                 <ChevronRight size={16} />
//               </button>

//               {/* DOTS */}
//               <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-20">
//                 {images.map((_, i) => (
//                   <span
//                     key={i}
//                     className={`h-1.5 w-1.5 rounded-full ${
//                       i === index ? "bg-white" : "bg-white/40"
//                     }`}
//                   />
//                 ))}
//               </div>
//             </>
//           )}

//           {/* VEG / NON-VEG */}
//           <div className="absolute top-2 left-2 bg-white p-1 rounded-md shadow z-40">
//             {item.isVeg ? (
//               <Leaf size={14} className="text-green-600" />
//             ) : (
//               <Flame size={14} className="text-red-600" />
//             )}
//           </div>

//           {/* EDIT / DELETE — DESKTOP ONLY */}
//           <div
//             className="
//               absolute inset-0 bg-black/30
//               hidden lg:flex
//               opacity-0 group-hover:opacity-100
//               items-center justify-center gap-4
//               transition z-20
//             "
//           >
//             <button
//               onClick={() => setEditOpen(true)}
//               className="bg-white p-2.5 rounded-full hover:scale-110 transition"
//             >
//               <Pencil size={16} />
//             </button>

//             <button
//               onClick={onDelete}
//               className="bg-white p-2.5 rounded-full text-red-600 hover:scale-110 transition"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         </div>

//         {/* INFO */}
//         <div className="mt-3 space-y-1">
//           <h4 className="font-bold text-sm truncate">{item.name}</h4>
//           <p className="text-xs text-gray-500">₹{Number(price).toFixed(2)}</p>
//         </div>

//         {/* ACTION BUTTONS — MOBILE + TABLET */}
//         <div className="mt-3 flex gap-2 lg:hidden">
//           <button
//             onClick={() => setEditOpen(true)}
//             className="flex-1 py-2 rounded-xl border text-xs font-bold"
//           >
//             Edit
//           </button>
//           <button
//             onClick={onDelete}
//             className="flex-1 py-2 rounded-xl border text-xs font-bold text-red-600"
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       {editOpen && (
//         <EditItemModal
//           item={item}
//           onClose={() => setEditOpen(false)}
//           onSuccess={() => {
//             refresh();
//             setEditOpen(false);
//           }}
//         />
//       )}
//     </>
//   );
// }

// import { useEffect, useRef, useState } from "react";
// import EditItemModal from "./modals/EditItemModal";
// import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

// export default function ItemCard({ item, onDelete, refresh }) {
//   const [editOpen, setEditOpen] = useState(false);

//   const images =
//     item.images?.length > 0 ? item.images : item.image ? [item.image] : [];

//   const [index, setIndex] = useState(0);
//   const touchStartX = useRef(null);

//   const price = item.price ?? item.basePrice ?? 0;

//   useEffect(() => {
//     setIndex(0);
//   }, [item._id]);

//   const prev = (e) => {
//     e?.stopPropagation();
//     setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
//   };

//   const next = (e) => {
//     e?.stopPropagation();
//     setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
//   };

//   const onTouchStart = (e) => {
//     touchStartX.current = e.touches[0].clientX;
//   };

//   const onTouchEnd = (e) => {
//     if (!touchStartX.current) return;
//     const diff = e.changedTouches[0].clientX - touchStartX.current;
//     if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
//     touchStartX.current = null;
//   };

//   return (
//     <>
//       <div className="group bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition">
//         {/* IMAGE */}
//         <div
//           className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
//           onTouchStart={onTouchStart}
//           onTouchEnd={onTouchEnd}
//         >
//           {images.length ? (
//             <img
//               src={images[index]}
//               alt={item.name}
//               className="w-full h-full object-cover transition lg:group-hover:scale-105"
//               draggable={false}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-xs text-gray-400">
//               No image
//             </div>
//           )}

//           {/* SLIDER */}
//           {images.length > 1 && (
//             <>
//               <button
//                 onClick={prev}
//                 className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center"
//               >
//                 <ChevronLeft size={14} />
//               </button>

//               <button
//                 onClick={next}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center"
//               >
//                 <ChevronRight size={14} />
//               </button>
//             </>
//           )}

//           {/* DOTS */}
//           {images.length > 1 && (
//             <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
//               {images.map((_, i) => (
//                 <span
//                   key={i}
//                   className={`h-1.5 w-1.5 rounded-full ${
//                     i === index ? "bg-white" : "bg-white/40"
//                   }`}
//                 />
//               ))}
//             </div>
//           )}

//           {/* ✅ VEG / NON-VEG BADGE — CLEAN VERSION */}
//           <div className="absolute top-2 left-2 z-20">
//             <div className="backdrop-blur-[1px] bg-black/20 rounded-sm p-0.5">
//               <VegNonVegIcon isVeg={item.isVeg} size={10} />
//             </div>
//           </div>

//           {/* DESKTOP ACTIONS */}
//           <div className="absolute inset-0 bg-black/30 hidden lg:flex opacity-0 group-hover:opacity-100 items-center justify-center gap-4 transition">
//             <button
//               onClick={() => setEditOpen(true)}
//               className="bg-white p-2 rounded-full hover:scale-110 transition"
//             >
//               <Pencil size={16} />
//             </button>

//             <button
//               onClick={onDelete}
//               className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         </div>

//         {/* INFO */}
//         <div className="mt-3 space-y-1">
//           <h4 className="text-sm font-medium truncate">{item.name}</h4>
//           <p className="text-sm font-semibold text-gray-900">
//             ₹{Number(price).toFixed(2)}
//           </p>
//         </div>

//         {/* MOBILE ACTIONS */}
//         <div className="mt-3 flex gap-2 lg:hidden">
//           <button
//             onClick={() => setEditOpen(true)}
//             className="flex-1 py-2 rounded-lg border text-xs font-medium"
//           >
//             Edit
//           </button>

//           <button
//             onClick={onDelete}
//             className="flex-1 py-2 rounded-lg border text-xs font-medium text-red-600"
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       {editOpen && (
//         <EditItemModal
//           item={item}
//           onClose={() => setEditOpen(false)}
//           onSuccess={() => {
//             refresh();
//             setEditOpen(false);
//           }}
//         />
//       )}
//     </>
//   );
// }

import { useEffect, useRef, useState } from "react";
import EditItemModal from "./modals/EditItemModal";
import {
  Pencil,
  Trash2,
  Leaf,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ItemCard({ item, onDelete, refresh }) {
  const [editOpen, setEditOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  // Normalize images: Check for images array first, then fallback to single image string
  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];

  const price = item.price ?? item.basePrice ?? 0;

  // Reset index when the item changes to avoid out-of-bounds errors
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
      <div className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition relative">
        <div
          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.length > 0 ? (
            <img
              key={images[index]} // Force re-render on index change
              src={images[index]}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 lg:group-hover:scale-105"
              draggable={false}
              onError={(e) => {
                e.target.src = "https://placehold.co/400?text=Image+Error";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              No Image
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition z-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition z-30"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-20">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === index ? "bg-white scale-125" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-2 left-2 bg-white p-1 rounded-md shadow z-40">
            {item.isVeg ? (
              <Leaf size={14} className="text-green-600" />
            ) : (
              <Flame size={14} className="text-red-600" />
            )}
          </div>

          <div className="absolute inset-0 bg-black/30 hidden lg:flex opacity-0 group-hover:opacity-100 items-center justify-center gap-4 transition z-20">
            <button
              onClick={() => setEditOpen(true)}
              className="bg-white p-2.5 rounded-full hover:scale-110 transition"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="bg-white p-2.5 rounded-full text-red-600 hover:scale-110 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h4 className="font-bold text-sm truncate">{item.name}</h4>
          <p className="text-xs text-gray-500">₹{Number(price).toFixed(2)}</p>
        </div>

        <div className="mt-3 flex gap-2 lg:hidden">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 py-2 rounded-xl border text-xs font-bold"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2 rounded-xl border text-xs font-bold text-red-600"
          >
            Delete
          </button>
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
