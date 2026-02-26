/**
 * WAITER STAFF APP
 * React component for waiter mobile app
 * Handles:
 * - PIN login with staff code + 4-digit PIN
 * - View tables and open sessions
 * - See customer carts pending approval
 * - Approve cart and give/display PIN to customer
 * - Mark items as served
 * - Receive "item ready" notifications from kitchen
 * - Shift management (in/out)
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LogOut, Lock, Check, Phone, Home } from "lucide-react";

import Axios from "../../api/axios";
import { setUserDetails, logout } from "../../store/auth/userSlice";
import { socketService } from "../../api/socket.service";

export function WaiterApp() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

  // State
  const [view, setView] = useState("login"); // login | dashboard | cart-review | order-tracking
  const [staffCode, setStaffCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [displayPin, setDisplayPin] = useState(null);
  const [readyItems, setReadyItems] = useState([]);

  // PIN Login
  const handlePinLogin = async (e) => {
    e.preventDefault();

    if (!staffCode || !pin) {
      toast.error("Please enter staff code and PIN");
      return;
    }

    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await Axios.post("/api/auth/staff/pin-login", {
        staffCode,
        pin,
        restaurantId: "current_restaurant_id", // Should come from env or context
      });

      if (response.data?.success) {
        dispatch(setUserDetails(response.data.data));
        localStorage.setItem("staffToken", response.data.token);
        setView("dashboard");
        toast.success(`Welcome, ${response.data.data.name}!`);

        // Join socket rooms for notifications
        socketService.emit("join-room", {
          room: `restaurant:${response.data.data.restaurantId}:waiters`,
        });

        // Reset form
        setStaffCode("");
        setPin("");

        // Load tables
        loadDashboard();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard - tables and pending carts
  const loadDashboard = async () => {
    try {
      // Get all tables for this restaurant
      const tablesRes = await Axios.get("/api/tables", {
        params: { restaurantId: user?.restaurantId },
      });

      if (tablesRes.data?.success) {
        setTables(tablesRes.data.data);
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    }
  };

  // View cart for a table
  const viewTableCart = async (tableId) => {
    try {
      // Get open session for this table
      const sessionRes = await Axios.get("/api/sessions", {
        params: { tableId, status: "OPEN" },
      });

      if (sessionRes.data?.success && sessionRes.data.data.length > 0) {
        const session = sessionRes.data.data[0];
        setCurrentTable(session);

        // Get cart items for session
        const cartRes = await Axios.get("/api/cart", {
          params: { sessionId: session._id },
        });

        if (cartRes.data?.success) {
          setCart(cartRes.data.data);
          setDisplayPin(session.currentPin); // Current table PIN
          setView("cart-review");
        }
      } else {
        toast.info("No open session for this table");
      }
    } catch (error) {
      toast.error("Failed to load table cart");
      console.error(error);
    }
  };

  // Approve cart and display PIN
  const approveCart = async () => {
    try {
      setLoading(true);

      // Confirm action with PIN
      const confirmPin = window.prompt("🔐 Confirm with your staff PIN:");

      if (!confirmPin) return;

      const response = await Axios.post("/api/auth/staff/confirm-action", {
        pin: confirmPin,
      });

      if (response.data?.success) {
        // PIN is valid and displayed
        toast.success(
          "✅ Ready! Display this PIN on your phone screen: " + displayPin,
        );

        // Stay on this screen for customer to see PIN
        // Update UI to show large PIN for customer
        setView("show-pin");
      }
    } catch (error) {
      toast.error("PIN verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Mark item as served
  const markItemServed = async (orderId, itemId) => {
    try {
      setLoading(true);

      const response = await Axios.put(
        `/api/order/${orderId}/item/${itemId}/serve`,
        { staffPinConfirm: true }, // Could require PIN here
      );

      if (response.data?.success) {
        toast.success("Item marked as served");
        setReadyItems(readyItems.filter((item) => item._id !== itemId));
      }
    } catch (error) {
      toast.error("Failed to mark item served");
    } finally {
      setLoading(false);
    }
  };

  // Socket listeners for kitchen notifications
  useEffect(() => {
    if (!user) return;

    socketService.on("item:ready", (data) => {
      setReadyItems((prev) => [
        ...prev,
        {
          ...data,
          sound: playSound(),
        },
      ]);
      toast.custom((t) => (
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex gap-2 items-center">
          <Check className="w-5 h-5" />
          <div>
            <strong>{data.itemName}</strong>
            <p className="text-sm">Ready for Table {data.tableName}!</p>
          </div>
          <button
            onClick={() => {}}
            className="ml-auto bg-white text-green-600 px-3 py-1 rounded text-sm font-semibold"
          >
            View
          </button>
        </div>
      ));
    });

    return () => {
      socketService.off("item:ready");
    };
  }, [user]);

  // Logout
  const handleLogout = async () => {
    try {
      await Axios.post("/api/auth/staff/pin-logout");
      dispatch(logout());
      setView("login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Play notification sound
  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play();
  };

  // --- RENDER VIEWS ---

  // LOGIN VIEW
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-gray-800">Plato Menu</h1>
            <p className="text-gray-600 mt-2">Waiter Staff Login</p>
          </div>

          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Staff Code
              </label>
              <input
                type="text"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                placeholder="E.g., W001, W002"
                className="w-full border border-gray-300 rounded-lg p-3 font-semibold tracking-widest"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                4-Digit PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
                placeholder="••••"
                maxLength="4"
                className="w-full border border-gray-300 rounded-lg p-3 font-semibold text-center tracking-widest text-2xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            🔒 Your PIN keeps your session secure
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW (Tables list)
  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-blue-50 pb-20">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-blue-100 text-sm">Waiter</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 p-3 rounded-full"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications Badge */}
        {readyItems.length > 0 && (
          <div className="bg-green-100 border-l-4 border-green-600 p-4 mx-4 mt-4 rounded sticky top-16">
            <strong className="text-green-800">
              🟢 {readyItems.length} item(s) ready for pickup!
            </strong>
          </div>
        )}

        {/* Tables Grid */}
        <div className="p-4 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Tables</h2>

          <div className="grid grid-cols-2 gap-3">
            {tables.map((table) => (
              <div
                key={table._id}
                className={`p-4 rounded-lg cursor-pointer transition transform hover:scale-105 ${
                  table.status === "OCCUPIED"
                    ? "bg-orange-200 border-2 border-orange-400"
                    : "bg-white border-2 border-gray-200"
                }`}
                onClick={() => viewTableCart(table._id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-gray-700" />
                  <strong className="text-lg">{table.tableName}</strong>
                </div>

                <p className="text-sm text-gray-600">
                  {table.status === "OCCUPIED" ? (
                    <span className="text-orange-700">🔴 Occupied</span>
                  ) : (
                    <span className="text-green-700">🟢 Available</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CART REVIEW VIEW
  if (view === "cart-review") {
    return (
      <div className="min-h-screen bg-blue-50">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <button
            onClick={() => setView("dashboard")}
            className="text-white hover:bg-blue-700 p-2 rounded"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">
            {currentTable?.tableName} - Cart Review
          </h1>
          <div />
        </div>

        {/* Cart Items */}
        <div className="p-4 max-w-2xl mx-auto space-y-3 mb-20">
          {cart.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-blue-600 mt-1">
                        📝 {item.notes}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-blue-600">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 flex gap-2">
          <button
            onClick={() => setView("dashboard")}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={approveCart}
            disabled={loading || cart.length === 0}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            ✅ Approve & Show PIN
          </button>
        </div>
      </div>
    );
  }

  // SHOW PIN VIEW
  if (view === "show-pin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center p-4">
        <div className="text-center text-white mb-8">
          <Check className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Cart Approved! ✅</h1>
          <p className="text-green-100">Show this PIN to the customer</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <p className="text-center text-gray-600 text-sm mb-4 font-semibold">
            CUSTOMER PIN
          </p>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 mb-6">
            <p className="text-white text-center text-6xl font-bold tracking-widest">
              {displayPin || "----"}
            </p>
          </div>

          <p className="text-center text-gray-700 mb-6">
            Let customer read and enter this PIN to place order
          </p>

          <button
            onClick={() => {
              setView("dashboard");
              setCart([]);
              setDisplayPin(null);
              setCurrentTable(null);
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            ✓ PIN Shown → Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default WaiterApp;
