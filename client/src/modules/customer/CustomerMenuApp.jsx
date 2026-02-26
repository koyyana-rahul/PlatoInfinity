/**
 * CUSTOMER MENU & CART UI
 * React component for public customer-facing menu
 * Handles:
 * - QR scan → join session
 * - Browse menu categories
 * - Add items to cart with customizations
 * - View cart
 * - Place order (triggers "Call Waiter" message)
 * - Track order status in real-time via Socket.io
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { MessageCircle, ShoppingCart, Plus, Minus, X } from "lucide-react";

import Axios from "../../api/axios";
import { setSessionToken } from "../../store/sessionSlice";
import { socketService } from "../../api/socket.service";

export function CustomerMenuApp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { brandSlug, restaurantSlug, tableId } = useParams();

  // State
  const sessionToken = useSelector((state) => state.session?.sessionToken);
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customization, setCustomization] = useState({
    spiceLevel: "medium",
    noOnion: false,
    jain: false,
    notes: "",
    quantity: 1,
  });

  // Effects
  useEffect(() => {
    if (!sessionToken) {
      joinSession();
    } else {
      loadMenu();
    }
  }, [sessionToken]);

  // Join session (customer opens QR)
  const joinSession = async () => {
    try {
      setLoading(true);
      const response = await Axios.post("/api/sessions/customer-join", {
        tableId,
        restaurantSlug,
      });

      if (response.data?.success) {
        const token = response.data.data.sessionToken;
        dispatch(setSessionToken(token));

        // Store in localStorage for persistence
        localStorage.setItem("plato_session_token", token);
        localStorage.setItem("plato_table_id", tableId);

        toast.success("Welcome! Browse our menu");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join session");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load menu
  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/api/customer/menu/${restaurantSlug}`, {
        headers: {
          "x-session-token": sessionToken,
          "x-table-id": tableId,
        },
      });

      if (response.data?.success) {
        setMenu(response.data.data.items || []);
        setSelectedCategory(response.data.data.categories?.[0] || null);
      }
    } catch (error) {
      console.error("Menu load error:", error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  // Item detail modal
  const openItemDetail = (item) => {
    setSelectedItem(item);
    setCustomization({
      spiceLevel: "medium",
      noOnion: false,
      jain: false,
      notes: "",
      quantity: 1,
    });
  };

  // Add to cart
  const addToCart = (item) => {
    const cartItem = {
      id: item._id,
      name: item.name,
      price: item.finalPrice || item.price,
      quantity: customization.quantity,
      image: item.image,
      customization,
    };

    setCart([...cart, cartItem]);
    toast.success(`${item.name} added to cart`);
    setSelectedItem(null);
  };

  // Remove from cart
  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
    toast.success("Item removed");
  };

  // Calculate total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Place order (shows PIN input)
  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      // Show PIN input dialog
      const pin = window.prompt(
        "🔐 Enter the 4-digit PIN given by your waiter:",
      );

      if (!pin || pin.length !== 4) {
        toast.error("Invalid PIN");
        return;
      }

      setLoading(true);

      // Convert cart to order items
      const items = cart.map((item) => ({
        branchMenuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedModifiers: [],
        customization: item.customization,
      }));

      const response = await Axios.post(
        "/api/order/place",
        {
          tablePin: pin,
          items,
          mode: cart.length === 1 ? "FAMILY" : "FAMILY", // Simplified
          deviceId: localStorage.getItem("plato_device_id"),
        },
        {
          headers: {
            "x-session-token": sessionToken,
            "x-table-id": tableId,
          },
        },
      );

      if (response.data?.success) {
        toast.success("Order placed! Watch for updates below 👇");
        setCart([]);
        setShowCart(false);

        // Navigate to order tracking
        navigate(`/order/${response.data.data.orderId}`);
      } else if (response.data?.requireNewPin) {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-orange-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">Plato Menu</h1>
            <p className="text-xs text-gray-500">
              Scan to order, pay when ready
            </p>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-3 bg-orange-100 rounded-full hover:bg-orange-200"
          >
            <ShoppingCart className="w-6 h-6 text-orange-600" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {loading && !menu.length ? (
          <div className="flex justify-center items-center h-96">
            Loading menu...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {menu.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition border border-orange-100"
                  >
                    <div className="flex gap-3 p-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description?.slice(0, 60)}...
                        </p>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-lg font-bold text-orange-600">
                            ₹{item.finalPrice || item.price}
                          </span>
                          <button
                            onClick={() => openItemDetail(item)}
                            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Your Cart
                </h2>

                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Start adding items
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                      {cart.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-orange-50 p-3 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">
                              {item.customization.quantity}x ₹{item.price}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-orange-200 pt-3 mb-3">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-orange-600">₹{cartTotal}</span>
                      </div>
                    </div>

                    <button
                      onClick={placeOrder}
                      disabled={loading}
                      className="w-full bg-orange-600 text-white py-3 rounded font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Call Waiter for PIN
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      💬 Wave or call your waiter — they'll give you the PIN
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedItem.name}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedItem.image && (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}

            <p className="text-gray-700 mb-4">{selectedItem.description}</p>

            {/* Customization Options */}
            <div className="space-y-3 mb-4 p-3 bg-orange-50 rounded">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Spice Level:
                </label>
                <select
                  value={customization.spiceLevel}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      spiceLevel: e.target.value,
                    })
                  }
                  className="w-full border border-orange-300 rounded p-2"
                >
                  <option value="mild">Mild 🟢</option>
                  <option value="medium">Medium 🟡</option>
                  <option value="spicy">Spicy 🔴</option>
                  <option value="very-spicy">Very Spicy 🌶️</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customization.noOnion}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      noOnion: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">No Onion</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customization.jain}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      jain: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Jain (No Onion/Garlic)</span>
              </label>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Special Requests:
                </label>
                <textarea
                  value={customization.notes}
                  onChange={(e) =>
                    setCustomization({
                      ...customization,
                      notes: e.target.value,
                    })
                  }
                  placeholder="E.g., less salt, extra side..."
                  className="w-full border border-orange-300 rounded p-2 text-sm"
                  rows="2"
                />
              </div>
            </div>

            {/* Quantity + Price */}
            <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCustomization({
                      ...customization,
                      quantity: Math.max(1, customization.quantity - 1),
                    })
                  }
                  className="bg-gray-300 p-1 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">
                  {customization.quantity}
                </span>
                <button
                  onClick={() =>
                    setCustomization({
                      ...customization,
                      quantity: customization.quantity + 1,
                    })
                  }
                  className="bg-gray-300 p-1 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-2xl font-bold text-orange-600">
                ₹
                {(selectedItem.finalPrice || selectedItem.price) *
                  customization.quantity}
              </span>
            </div>

            <button
              onClick={() => {
                addToCart(selectedItem);
              }}
              className="w-full bg-orange-600 text-white py-3 rounded font-semibold hover:bg-orange-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerMenuApp;
