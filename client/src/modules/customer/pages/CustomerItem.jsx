import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";

import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

import { addToCart, updateCartItem } from "../../../store/customer/cartThunks";
import { placeOrder } from "../../../store/customer/orderThunks";
import { selectCart } from "../../../store/customer/cartSelectors";

export default function CustomerItem() {
  const { itemId, brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ================= SESSION ================= */
  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  /* ================= REDUX ================= */
  const cart = useSelector(selectCart);

  /* ================= STATE ================= */
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= EXISTING CART ITEM ================= */
  const existingCartItem = useMemo(
    () => cart?.items?.find((i) => i.branchMenuItemId === itemId),
    [cart, itemId],
  );

  const qty = existingCartItem?.quantity || 0;

  /* ================= SESSION GUARD ================= */
  const ensureSession = () => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(base, { replace: true });
      return false;
    }
    return true;
  };

  /* ================= HARD GUARD (ON LOAD) ================= */
  useEffect(() => {
    if (!sessionId) {
      navigate(base, { replace: true });
    }
  }, [sessionId, navigate, base]);

  /* ================= LOAD ITEM ================= */
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

  /* ================= CART ACTIONS ================= */
  const addOne = () => {
    if (!ensureSession()) return;
    dispatch(addToCart({ branchMenuItemId: item.id, quantity: 1 }));
  };

  const plusOne = () => {
    if (!ensureSession() || !existingCartItem) return;
    dispatch(
      updateCartItem({
        cartItemId: existingCartItem._id,
        quantity: qty + 1,
      }),
    );
  };

  const minusOne = () => {
    if (!ensureSession() || !existingCartItem) return;
    if (qty <= 1) return;

    dispatch(
      updateCartItem({
        cartItemId: existingCartItem._id,
        quantity: qty - 1,
      }),
    );
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="h-[420px] bg-gray-200 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow">
        Item not available
      </div>
    );
  }

  return (
    <div className="pb-48 bg-gray-50">
      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-12 px-4 lg:px-8 pt-4">
        {/* IMAGE */}
        <div className="relative">
          <img
            src={item.image || "/food-placeholder.jpg"}
            alt={item.name}
            className="w-full h-80 lg:h-[460px] object-cover bg-gray-100 rounded-3xl shadow-lg"
          />

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:bg-white"
          >
            ←
          </button>

          {/* VEG / NON-VEG */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-md shadow-md">
            <VegNonVegIcon isVeg={item.isVeg} size={12} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-6 lg:mt-0 space-y-5">
          <div className="flex justify-between items-start gap-6">
            <h1 className="text-2xl lg:text-3xl font-semibold leading-snug">
              {item.name}
            </h1>

            <span className="text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
              ₹{item.price}
            </span>
          </div>

          {item.description && (
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed max-w-xl">
              {item.description}
            </p>
          )}

          <div className="h-px bg-gray-200 max-w-sm" />

          <p className="text-xs text-gray-400">
            Inclusive of all taxes • Prepared fresh on order
          </p>
        </div>
      </div>

      {/* FLOATING ADD / QTY CONTROL */}
      <div className="fixed bottom-24 right-4 lg:right-8 z-40">
        {qty === 0 ? (
          <button
            onClick={addOne}
            className="w-16 h-16 rounded-full bg-emerald-600 text-white text-4xl font-light shadow-2xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition"
          >
            +
          </button>
        ) : (
          <div className="flex items-center gap-5 bg-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl">
            <button
              onClick={minusOne}
              className="text-3xl font-light active:scale-90"
            >
              −
            </button>

            <span className="text-xl font-semibold">{qty}</span>

            <button
              onClick={plusOne}
              className="text-3xl font-light active:scale-90"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
