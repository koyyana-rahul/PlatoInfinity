// import { useEffect, useMemo, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import toast from "react-hot-toast";
// import { ChevronLeft, Loader2, Info } from "lucide-react";

// import Axios from "../../../api/axios";
// import customerApi from "../../../api/customer.api";

// import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

// import { addToCart, updateCartItem } from "../../../store/customer/cartThunks";
// import { selectCart } from "../../../store/customer/cartSelectors";

// export default function CustomerItem() {
//   const { itemId, brandSlug, restaurantSlug, tableId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   /* ================= SESSION ================= */
//   const sessionKey = `plato:customerSession:${tableId}`;
//   const sessionId = localStorage.getItem(sessionKey);
//   const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

//   /* ================= REDUX ================= */
//   const cart = useSelector(selectCart);

//   /* ================= STATE ================= */
//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ================= EXISTING CART ITEM ================= */
//   const existingCartItem = useMemo(
//     () => cart?.items?.find((i) => i.branchMenuItemId === itemId),
//     [cart, itemId],
//   );

//   const qty = existingCartItem?.quantity || 0;

//   /* ================= SESSION GUARD ================= */
//   const ensureSession = () => {
//     if (!sessionId) {
//       toast.error("Please join the table first");
//       navigate(base, { replace: true });
//       return false;
//     }
//     return true;
//   };

//   /* ================= HARD GUARD (ON LOAD) ================= */
//   useEffect(() => {
//     if (!sessionId) {
//       navigate(base, { replace: true });
//     }
//   }, [sessionId, navigate, base]);

//   /* ================= LOAD ITEM ================= */
//   useEffect(() => {
//     if (!itemId) return;

//     const load = async () => {
//       try {
//         setLoading(true);
//         const res = await Axios(customerApi.publicMenuItem(itemId));
//         setItem(res.data?.data || null);
//       } catch {
//         toast.error("Item not found");
//         navigate(base + "/menu", { replace: true });
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [itemId, navigate, base]);

//   /* ================= CART ACTIONS ================= */
//   const handleAddOne = () => {
//     if (!ensureSession()) return;
//     if (window.navigator.vibrate) window.navigator.vibrate(10);
//     dispatch(addToCart({ branchMenuItemId: item.id, quantity: 1 }));
//   };

//   const handleUpdate = (newQty) => {
//     if (!ensureSession() || !existingCartItem) return;
//     if (newQty < 1) return;
//     if (window.navigator.vibrate) window.navigator.vibrate(5);
//     dispatch(
//       updateCartItem({
//         cartItemId: existingCartItem._id,
//         quantity: newQty,
//       }),
//     );
//   };

//   if (loading) {
//     return (
//       <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-4 z-[70]">
//         <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
//         <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
//           Loading Details
//         </p>
//       </div>
//     );
//   }

//   if (!item) return null;

//   return (
//     <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen bg-white animate-in fade-in duration-500">
//       {/* 1. HERO IMAGE SECTION */}
//       <div className="relative w-full aspect-[4/3] sm:aspect-video overflow-hidden">
//         <img
//           src={item.image || "/food-placeholder.jpg"}
//           alt={item.name}
//           className="w-full h-full object-cover"
//         />

//         {/* BACK BUTTON (Glassmorphism) */}
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-900 active:scale-90 transition-transform"
//         >
//           <ChevronLeft size={20} strokeWidth={2.5} />
//         </button>

//         {/* VEG/NON-VEG TAG */}
//         <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-2 py-2 rounded-xl shadow-md">
//           <VegNonVegIcon isVeg={item.isVeg} size={14} />
//         </div>
//       </div>

//       {/* 2. ITEM DETAILS */}
//       <div className="px-6 pt-6 pb-40 flex-1">
//         {/* HEADER: NAME & PRICE */}
//         <div className="flex justify-between items-start gap-4 mb-4">
//           <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
//             {item.name}
//           </h1>
//           <span className="text-xl font-black text-slate-900 pt-1">
//             ₹{item.price}
//           </span>
//         </div>

//         {/* DESCRIPTION */}
//         {item.description && (
//           <p className="text-[15px] leading-relaxed text-slate-500 font-medium mb-6">
//             {item.description}
//           </p>
//         )}

//         {/* INFO BADGES */}
//         <div className="flex flex-col gap-4 py-6 border-y border-slate-50">
//           <div className="flex items-center gap-3 text-slate-400">
//             <Info size={16} />
//             <p className="text-[11px] font-bold uppercase tracking-widest leading-none">
//               Prepared fresh on order
//             </p>
//           </div>
//           <div className="flex items-center gap-3 text-slate-400">
//             <span className="w-4 h-[1px] bg-slate-300"></span>
//             <p className="text-[11px] font-bold uppercase tracking-widest leading-none">
//               Inclusive of all taxes
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* 3. FLOATING CART CONTROLS (Wagamama Black Theme) */}
//       <div className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
//         <div className="max-w-2xl mx-auto flex justify-end pointer-events-auto">
//           {qty === 0 ? (
//             <button
//               onClick={handleAddOne}
//               className="h-14 px-10 bg-[#111] text-white rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
//             >
//               <span className="text-[11px] font-black uppercase tracking-[0.2em]">
//                 Add to Cart
//               </span>
//               <span className="text-xl font-light group-hover:translate-x-1 transition-transform">
//                 +
//               </span>
//             </button>
//           ) : (
//             <div className="h-14 flex items-center bg-[#111] text-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-4">
//               <button
//                 onClick={() => handleUpdate(qty - 1)}
//                 className="w-14 h-full flex items-center justify-center text-xl font-light hover:bg-white/10 active:scale-90"
//               >
//                 −
//               </button>

//               <div className="w-10 h-full flex items-center justify-center">
//                 <span className="text-sm font-black">{qty}</span>
//               </div>

//               <button
//                 onClick={() => handleUpdate(qty + 1)}
//                 className="w-14 h-full flex items-center justify-center text-xl font-light hover:bg-white/10 active:scale-90"
//               >
//                 +
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         /* Remove body scroll jump when navigating */
//         body { background-color: white; }
//       `}</style>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Loader2,
  Info,
  ShoppingBag,
  Plus,
  Minus,
  ShieldCheck,
  Clock,
} from "lucide-react";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

import {
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../../../store/customer/cartThunks";
import { selectCart } from "../../../store/customer/cartSelectors";

export default function CustomerItem() {
  const { itemId, brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const cart = useSelector(selectCart);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const existingCartItem = useMemo(
    () => cart?.items?.find((i) => i.branchMenuItemId === itemId),
    [cart, itemId],
  );

  const qty = existingCartItem?.quantity || 0;

  useEffect(() => {
    if (!itemId) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await Axios(customerApi.publicMenuItem(itemId));
        setItem(res.data?.data || null);
      } catch {
        toast.error("Item not found");
        navigate(base + "/menu", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [itemId, navigate, base]);

  const handleAddOne = () => {
    if (!sessionId) {
      toast.error("Please join the table first");
      return;
    }
    dispatch(addToCart({ branchMenuItemId: item.id, quantity: 1 }));
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const handleUpdate = (newQty) => {
    if (!existingCartItem) return;
    if (newQty < 1) {
      dispatch(removeCartItem(existingCartItem._id));
    } else {
      dispatch(
        updateCartItem({ cartItemId: existingCartItem._id, quantity: newQty }),
      );
    }
    if (window.navigator.vibrate) window.navigator.vibrate(5);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-3">
        <Loader2
          className="w-6 h-6 text-slate-900 animate-spin"
          strokeWidth={1.5}
        />
        <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
          Premium Selection
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen bg-white font-sans antialiased">
      {/* --- HERO SECTION --- */}
      <div className="relative w-full aspect-square sm:aspect-video overflow-hidden">
        <img
          src={item?.image || "/food-placeholder.jpg"}
          alt={item?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
            <VegNonVegIcon isVeg={item?.isVeg} size={14} />
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="relative -mt-8 bg-white rounded-t-[32px] px-7 pt-10 pb-40 flex-1 border-t border-slate-100">
        {/* Name & Price Container */}
        <div className="flex flex-col mb-8">
          <h1 className="text-[28px] font-black text-slate-900 leading-[1.1] mb-2">
            {item?.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{item?.price}
            </span>
            <span className="h-4 w-[1px] bg-slate-200"></span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Standard Portion
            </span>
          </div>
        </div>

        {/* Description */}
        {item?.description && (
          <p className="text-[15px] leading-[1.6] text-slate-500 font-medium mb-10">
            {item?.description}
          </p>
        )}

        {/* Professional Badges */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
            <Clock size={18} className="text-slate-900" />
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Freshly Made
            </p>
            <p className="text-[10px] text-slate-500 leading-normal">
              Prepared specifically for your order.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
            <ShieldCheck size={18} className="text-slate-900" />
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Quality Insured
            </p>
            <p className="text-[10px] text-slate-500 leading-normal">
              Best-in-class ingredients used.
            </p>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-2 py-6 border-t border-slate-50 opacity-60">
          <Info size={14} className="text-slate-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Inclusive of all taxes & hygiene charges
          </p>
        </div>
      </div>

      {/* --- FLOATING CART ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="max-w-2xl mx-auto">
          {qty === 0 ? (
            <button
              onClick={handleAddOne}
              className="w-full h-[64px] bg-slate-900 text-white rounded-[20px] shadow-2xl flex items-center justify-between px-8 active:scale-[0.98] transition-all group"
            >
              <span className="text-[12px] font-black uppercase tracking-[0.25em]">
                Add Item
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold opacity-60">
                  ₹{item?.price}
                </span>
                <Plus size={18} strokeWidth={3} />
              </div>
            </button>
          ) : (
            <div className="w-full h-[64px] flex items-center bg-slate-900 text-white rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => handleUpdate(qty - 1)}
                className="w-20 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Minus size={20} strokeWidth={3} />
              </button>
              <div className="flex-1 h-full flex flex-col items-center justify-center border-x border-white/10 bg-white/5">
                <span className="text-lg font-black">{qty}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                  Selected
                </span>
              </div>
              <button
                onClick={() => handleUpdate(qty + 1)}
                className="w-20 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        body { background-color: #F8FAFC; -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
