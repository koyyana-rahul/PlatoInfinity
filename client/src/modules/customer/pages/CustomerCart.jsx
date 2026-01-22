import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import QuantityStepper from "../components/QuantityStepper";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "../../../store/customer/cartThunks";
import { placeOrder } from "../../../store/customer/orderThunks";
import {
  selectCartState,
  selectCartItems,
  selectTotalQty,
  selectTotalAmount,
  selectCartLoading,
} from "../../../store/customer/cartSelectors";

export default function CustomerCart() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ================= SESSION ================= */
  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  /* ================= REDUX ================= */
  const cart = useSelector(selectCartState);
  const items = useSelector(selectCartItems);
  const totalQty = useSelector(selectTotalQty);
  const totalAmount = useSelector(selectTotalAmount);
  const loading = useSelector(selectCartLoading);

  /* ================= LOCAL UI ================= */
  const [orderType, setOrderType] = useState("DINE_IN");

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(base, { replace: true });
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, sessionId, navigate, base]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Your Cart</h1>
        <div className="bg-white rounded-xl p-6 text-gray-600">
          Your cart is empty.
        </div>
        <button
          onClick={() => navigate(base + "/menu")}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  /* ================= MAIN ================= */

  return (
    <div className="pb-40 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="px-4 pt-4 pb-3 sticky top-0 bg-white z-20 border-b">
        <h1 className="text-xl font-semibold">Your Order</h1>
      </div>

      {/* ORDER TYPE */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl p-2 flex gap-2">
          {["DINE_IN", "TAKEAWAY", "DELIVERY"].map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                orderType === t
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS */}
      <div className="px-4 mt-4 space-y-4">
        {items.map((it) => (
          <div
            key={it._id}
            className="bg-white rounded-xl p-4 flex justify-between gap-4"
          >
            {/* INFO */}
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{it.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{Math.round(it.price)} each
              </p>

              <div className="mt-3">
                <QuantityStepper
                  value={it.quantity}
                  onAdd={() =>
                    dispatch(
                      updateCartItem({
                        cartItemId: it._id,
                        quantity: it.quantity + 1,
                      }),
                    )
                  }
                  onMinus={() => {
                    if (it.quantity <= 1) {
                      dispatch(removeCartItem(it._id));
                    } else {
                      dispatch(
                        updateCartItem({
                          cartItemId: it._id,
                          quantity: it.quantity - 1,
                        }),
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* PRICE */}
            <div className="text-right">
              <p className="font-semibold text-sm">
                ₹{Math.round(it.price * it.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl p-4 space-y-2">
          <Row label="Items" value={totalQty} />
          <Row label="Subtotal" value={`₹${Math.round(cart.subtotal || 0)}`} />
          <Row label="Tax" value={`₹${Math.round(cart.tax || 0)}`} />
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{Math.round(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM STICKY CHECKOUT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {totalQty} item{totalQty > 1 ? "s" : ""}
            </p>
            <p className="text-lg font-semibold">₹{Math.round(totalAmount)}</p>
          </div>

          <button
            onClick={async () => {
              try {
                await dispatch(placeOrder()).unwrap();
                toast.success("Order placed");
                navigate(base + "/orders");
              } catch (err) {
                toast.error(err || "Failed to place order");
              }
            }}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold"
          >
            ORDER
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
