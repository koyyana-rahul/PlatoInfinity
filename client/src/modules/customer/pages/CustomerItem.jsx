import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  Plus,
  Minus,
  ShieldCheck,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";
import {
  fallbackCustomerImage,
  getItemImages,
} from "../utils/resolveItemImages";

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

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const cart = useSelector(selectCart);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const touchStartX = useRef(null);

  const existingCartItem = useMemo(
    () => cart?.items?.find((i) => i.branchMenuItemId === itemId),
    [cart, itemId],
  );

  const qty = existingCartItem?.quantity || 0;

  const images = useMemo(() => {
    return getItemImages(item);
  }, [item]);

  useEffect(() => {
    setImageIndex(0);
  }, [item?._id, item?.id]);

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
    dispatch(
      addToCart({
        branchMenuItemId: item?.id || item?._id,
        quantity: 1,
      }),
    );
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
          Loading Item
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white ring-1 ring-slate-100 p-8 text-center">
          <p className="text-lg font-bold text-slate-900">Item not available</p>
          <button
            onClick={() => navigate(base + "/menu")}
            className="mt-5 h-11 px-5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const price = Number(item?.price || 0);
  const nextImage = () => setImageIndex((i) => (i + 1) % images.length);
  const prevImage = () =>
    setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans antialiased pb-28 sm:pb-32">
      <div className="relative w-full aspect-[5/4] sm:aspect-[16/10] overflow-hidden rounded-b-[28px] sm:rounded-b-[34px] shadow-[0_30px_60px_-45px_rgba(15,23,42,0.75)]">
        <img
          src={images[imageIndex]}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={fallbackCustomerImage}
          onTouchStart={(e) => {
            touchStartX.current = e.touches?.[0]?.clientX || null;
          }}
          onTouchEnd={(e) => {
            const endX = e.changedTouches?.[0]?.clientX;
            if (touchStartX.current == null || typeof endX !== "number") return;
            const diff = endX - touchStartX.current;
            if (Math.abs(diff) > 40) {
              if (diff > 0) prevImage();
              else nextImage();
            }
            touchStartX.current = null;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/5" />

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 sm:left-5 sm:top-5 z-20 w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <div className="absolute right-4 top-4 sm:right-5 sm:top-5 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <VegNonVegIcon isVeg={item.isVeg} size={14} />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            {item.isVeg ? "Veg" : "Non Veg"}
          </span>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-md active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-md active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === imageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute left-4 right-4 bottom-4 sm:left-5 sm:right-5 sm:bottom-5 z-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg ring-1 ring-white/60">
            <Clock size={12} className="text-slate-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
              Freshly prepared on order
            </span>
          </div>
        </div>
      </div>

      <div className="relative -mt-6 sm:-mt-7 bg-white rounded-t-[26px] sm:rounded-t-[30px] px-4 sm:px-6 pt-6 sm:pt-8 pb-8 flex-1 border-t border-slate-100 shadow-[0_-15px_35px_-28px_rgba(15,23,42,0.5)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[22px] sm:text-[28px] font-extrabold text-slate-900 leading-tight tracking-tight">
              {item.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
                Bestseller
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 inline-flex items-center gap-1">
                <Star size={10} className="fill-amber-500 text-amber-500" /> 4.6
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                High Rating
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                4.6
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                <Clock size={12} className="text-slate-600" /> 20-25 min
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                <VegNonVegIcon isVeg={item.isVeg} size={11} />
                {item.isVeg ? "Pure Veg" : "Chef Special"}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              Price
            </p>
            <p className="text-[24px] sm:text-[26px] font-extrabold text-slate-900">
              ₹{price.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] font-bold text-emerald-600 mt-1">
              Incl. all taxes
            </p>
          </div>
        </div>

        {item.description && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.55)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              About this dish
            </p>
            <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.7] text-slate-700 font-medium">
              {item.description}
            </p>
          </div>
        )}

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 flex items-start gap-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.65)]">
            <Clock size={18} className="text-slate-900 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Freshly made
              </p>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Prepared on order.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 flex items-start gap-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.65)]">
            <ShieldCheck size={18} className="text-slate-900 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Quality assured
              </p>
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                Fresh ingredients, kitchen verified.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 p-4 sm:p-5 shadow-[0_10px_25px_-22px_rgba(249,115,22,0.9)]">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 inline-flex items-center gap-1.5">
            <Sparkles size={12} />
            Chef Note
          </p>
          <p className="mt-1 text-sm text-slate-700 font-semibold">
            Balanced flavor profile and perfect for table sharing.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 py-2 border-t border-slate-100/70">
          <Info size={14} className="text-slate-400" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Inclusive of all taxes & hygiene charges
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5 bg-gradient-to-t from-white via-white/90 to-transparent border-t border-slate-200/70 backdrop-blur-md pb-[calc(env(safe-area-inset-bottom)+0.7rem)]">
        <div className="max-w-3xl mx-auto">
          {qty === 0 ? (
            <button
              onClick={handleAddOne}
              className="w-full h-[58px] sm:h-[64px] bg-gradient-to-r from-[#F35C2B] via-[#FF6B35] to-[#FF8A4D] text-white rounded-2xl sm:rounded-[20px] shadow-2xl flex items-center justify-between px-5 sm:px-8 active:scale-[0.98] transition-all group"
            >
              <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.22em]">
                Add Item
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black opacity-90">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <Plus size={18} strokeWidth={3} />
              </div>
            </button>
          ) : (
            <div className="w-full h-[58px] sm:h-[64px] flex items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl sm:rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => handleUpdate(qty - 1)}
                className="w-16 sm:w-20 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Minus size={20} strokeWidth={3} />
              </button>
              <div className="flex-1 h-full flex flex-col items-center justify-center border-x border-white/10 bg-white/5">
                <span className="text-base sm:text-lg font-black">{qty}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                  Selected
                </span>
              </div>
              <button
                onClick={() => handleUpdate(qty + 1)}
                className="w-16 sm:w-20 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
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
