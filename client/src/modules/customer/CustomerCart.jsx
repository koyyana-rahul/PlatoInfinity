import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

export default function CustomerCart() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await Axios(customerApi.cart.get);
      setCart(res.data?.data || null);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Join session first");
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (cartItemId, quantity) => {
    try {
      await Axios({
        ...customerApi.cart.update,
        data: { cartItemId, quantity },
      });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  const remove = async (cartItemId) => {
    try {
      await Axios(customerApi.cart.remove(cartItemId));
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove");
    }
  };

  const placeOrder = async () => {
    try {
      setPlacing(true);
      await Axios(customerApi.order.place);
      toast.success("Order placed");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />;
  }

  if (!cart) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cart</h1>
          <p className="text-sm text-gray-600 mt-1">Review items and place order.</p>
        </div>

        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          {loadError || "Please join the table session first."}
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Cart</h1>
        <p className="text-sm text-gray-600 mt-1">Review items and place order.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          Your cart is empty.
        </div>
      ) : (
        <div className="bg-white border rounded-2xl divide-y">
          {items.map((it) => (
            <div key={it._id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p>
                <p className="text-xs text-gray-500">₹{Math.round(it.price || 0)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(it._id, Math.max(1, (it.quantity || 1) - 1))}
                  className="h-9 w-9 rounded-lg border hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-sm font-semibold w-8 text-center">{it.quantity}</span>
                <button
                  onClick={() => updateQty(it._id, Math.min(20, (it.quantity || 1) + 1))}
                  className="h-9 w-9 rounded-lg border hover:bg-gray-50"
                >
                  +
                </button>
                <button
                  onClick={() => remove(it._id)}
                  className="h-9 px-3 rounded-lg border text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Info label="Subtotal" value={`₹${Math.round(cart.subtotal || 0)}`} />
            <Info label="Tax" value={`₹${Math.round(cart.tax || 0)}`} />
            <Info label="Total" value={`₹${Math.round(cart.totalAmount || 0)}`} />
            <Info label="Items" value={items.length} />
          </div>

          <div className="p-4">
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-3">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-900 break-all">{value}</p>
    </div>
  );
}
