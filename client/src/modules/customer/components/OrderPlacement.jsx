/**
 * ======================================================
 * CUSTOMER ORDER PLACEMENT COMPONENT
 * ======================================================
 * Handles cart-to-order placement with real-time updates
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import SummaryApi from "../../../api/summaryApi";
import { useSocket } from "../../../socket/SocketProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const OrderPlacement = ({ sessionId, restaurantId, onOrderPlaced }) => {
  const socket = useSocket();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderStatus, setOrderStatus] = useState(null);

  /**
   * 1️⃣ Load cart items
   */
  useEffect(() => {
    const loadCart = async () => {
      try {
        const res = await Axios({
          ...SummaryApi.getCart,
          params: { sessionId },
        });

        if (res.data?.success) {
          setCart(res.data.data);
          const total = res.data.data.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          setTotalAmount(total);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };

    loadCart();
  }, [sessionId]);

  /**
   * 2️⃣ Real-time cart updates
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("cart:updated", (data) => {
      setTotalAmount(data.totalAmount);
      toast.success(`Cart updated: ${data.totalItems} items`);
    });

    return () => socket.off("cart:updated");
  }, [socket]);

  /**
   * 3️⃣ Listen for order confirmation
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("order:confirmed", (data) => {
      setOrderStatus({
        type: "confirmed",
        orderNumber: data.orderNumber,
        estimatedTime: data.estimatedTime,
      });

      toast.success(`Order #${data.orderNumber} placed successfully!`);
      onOrderPlaced?.(data);
    });

    return () => socket.off("order:confirmed");
  }, [socket, onOrderPlaced]);

  /**
   * 4️⃣ Listen for order item ready
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("order:item-ready", (data) => {
      toast.success(`${data.itemName} is ready!`);
      setOrderStatus((prev) => ({
        ...prev,
        readyItems: (prev?.readyItems || []).concat(data.itemName),
      }));
    });

    return () => socket.off("order:item-ready");
  }, [socket]);

  /**
   * 5️⃣ Place order handler
   */
  const handlePlaceOrder = useCallback(async () => {
    if (!cart.length) {
      toast.error("Cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(
        `${SummaryApi.placeOrder.url}`,
        {},
        {
          headers: {
            "x-session-token": sessionId,
          },
        },
      );

      if (response.data?.success) {
        setCart([]);
        setTotalAmount(0);
        // Socket event will handle the rest via order:confirmed
      } else {
        toast.error(response.data?.message || "Failed to place order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order placement failed");
      console.error("Order placement error:", error);
    } finally {
      setLoading(false);
    }
  }, [cart, sessionId]);

  /**
   * Render confirmation state
   */
  if (orderStatus?.type === "confirmed") {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-500">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-4">Order #{orderStatus.orderNumber}</p>
          <p className="text-lg text-gray-700 mb-2">
            Estimated Time: {orderStatus.estimatedTime}
          </p>

          {orderStatus.readyItems?.length > 0 && (
            <div className="mt-4 bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-700 mb-2">
                Ready Items:
              </h3>
              <ul>
                {orderStatus.readyItems.map((item, idx) => (
                  <li key={idx} className="text-green-600">
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Your waiter will serve the items shortly
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {cart.length > 0 ? (
          cart.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 bg-gray-50 rounded border"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-lg">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400">
              Add items from the menu to place an order
            </p>
          </div>
        )}
      </div>

      {/* Total */}
      {cart.length > 0 && (
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || !cart.length}
        className={`w-full py-3 rounded-lg font-bold text-white transition ${
          loading || !cart.length
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Placing Order...
          </div>
        ) : (
          `Place Order (${cart.length} items)`
        )}
      </button>

      {/* Info Message */}
      <p className="text-center text-sm text-gray-500 mt-4">
        📱 You'll receive real-time updates on your order status
      </p>
    </div>
  );
};

export default OrderPlacement;
