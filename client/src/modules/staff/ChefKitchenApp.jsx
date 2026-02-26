/**
 * CHEF/KITCHEN APP
 * React component for kitchen staff (chefs)
 * Handles:
 * - PIN login with staff code + 4-digit PIN
 * - View only their assigned kitchen station items
 * - See items: NEW → IN_PROGRESS → READY
 * - Claim items to start cooking
 * - Mark items as READY (with PIN confirmation)
 * - Real-time socket.io updates from order placement
 * - Priority queue (by table, by order creation time)
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LogOut, Lock, Clock, CheckCircle, Flame, Heart } from "lucide-react";

import Axios from "../../api/axios";
import { setUserDetails, logout } from "../../store/auth/userSlice";
import { socketService } from "../../api/socket.service";

export function ChefKitchenApp() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

  // State
  const [view, setView] = useState("login");
  const [staffCode, setStaffCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [claimingItemId, setClaimingItemId] = useState(null);
  const [markingReadyItemId, setMarkingReadyItemId] = useState(null);
  const [confirmPin, setConfirmPin] = useState("");

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
        restaurantId: "current_restaurant_id",
      });

      if (response.data?.success) {
        dispatch(setUserDetails(response.data.data));
        localStorage.setItem("staffToken", response.data.token);
        setView("kitchen");
        toast.success(
          `Welcome ${response.data.data.name}! Your station is ready.`,
        );

        // Join socket room for this station
        socketService.emit("join-room", {
          room: `restaurant:${response.data.data.restaurantId}:kitchen`,
          stationId: response.data.data.kitchenStationId,
        });

        setStaffCode("");
        setPin("");
        loadKitchenItems();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Load items for chef's station
  const loadKitchenItems = async () => {
    try {
      const response = await Axios.get("/api/kitchen/items", {
        params: {
          stationId: user?.kitchenStationId,
          restaurantId: user?.restaurantId,
          status: ["NEW", "IN_PROGRESS"],
        },
      });

      if (response.data?.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error("Load items error:", error);
    }
  };

  // Claim item (chef starts working on it)
  const claimItem = async (itemId) => {
    try {
      setClaimingItemId(itemId);

      const response = await Axios.put(`/api/kitchen/item/${itemId}/claim`, {});

      if (response.data?.success) {
        setItems(
          items.map((item) =>
            item._id === itemId
              ? { ...item, itemStatus: "IN_PROGRESS", chefId: user?._id }
              : item,
          ),
        );
        toast.success("Item claim claimed! Start cooking 👨‍🍳");
      }
    } catch (error) {
      toast.error("Failed to claim item");
    } finally {
      setClaimingItemId(null);
    }
  };

  // Mark item as ready (requires PIN verification)
  const markItemReady = async (itemId) => {
    if (!confirmPin || confirmPin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    try {
      setMarkingReadyItemId(itemId);

      const response = await Axios.put(`/api/kitchen/item/${itemId}/ready`, {
        staffPin: confirmPin,
      });

      if (response.data?.success) {
        // Remove from list (item is now READY)
        setItems(items.filter((item) => item._id !== itemId));
        setConfirmPin("");
        toast.success("✅ Item marked as READY!");

        // Play sound notification
        playSound();

        // Refresh in a moment
        setTimeout(loadKitchenItems, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark ready");
    } finally {
      setMarkingReadyItemId(null);
    }
  };

  // Play sound notification
  const playSound = () => {
    const audio = new Audio("/kitchen-bell.mp3");
    audio.volume = 0.8;
    audio.play();
  };

  // Socket listener for new orders
  useEffect(() => {
    if (!user) return;

    socketService.on("order:placed", (data) => {
      // Check if any items are for this station
      const itemsForStation = data.items?.filter(
        (item) => item.stationType === user?.kitchenStationId?.stationType,
      );

      if (itemsForStation?.length > 0) {
        playSound();
        toast.custom(
          (t) => (
            <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-1">🔴 NEW ORDER!</h3>
              <p className="text-sm">
                Table {data.tableName} - {itemsForStation.length} item(s)
              </p>
            </div>
          ),
          { position: "top-center" },
        );

        // Refresh items
        setTimeout(loadKitchenItems, 500);
      }
    });

    return () => {
      socketService.off("order:placed");
    };
  }, [user]);

  // Logout
  const handleLogout = async () => {
    try {
      await Axios.post("/api/auth/staff/pin-logout");
      dispatch(logout());
      setView("login");
      setItems([]);
      toast.success("Logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- LOGIN VIEW ---
  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <Flame className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-gray-800">Kitchen</h1>
            <p className="text-gray-600 mt-2">Chef Station Login</p>
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
                placeholder="E.g., C001, C002"
                className="w-full border border-gray-300 rounded-lg p-3 font-semibold"
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
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Enter Kitchen"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- KITCHEN VIEW ---
  if (view === "kitchen") {
    return (
      <div className="min-h-screen bg-gray-900 pb-24">
        {/* Header */}
        <div className="bg-red-700 text-white p-4 sticky top-0 z-10 shadow-xl">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">🔥 Kitchen</h1>
              <p className="text-red-200 text-sm">{user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-red-800 px-4 py-2 rounded-lg">
                <p className="text-sm text-red-200">Pending</p>
                <p className="text-2xl font-bold">
                  {items.filter((i) => i.itemStatus === "NEW").length}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-800 hover:bg-red-900 p-3 rounded"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-4 max-w-4xl mx-auto space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-lg">All caught up! ✓</p>
              <p className="text-sm mt-2">New orders will appear here</p>
            </div>
          ) : (
            items
              .sort((a, b) => {
                // Sort by: NEW first, then by table name, then by creation time
                if (a.itemStatus !== b.itemStatus) {
                  return a.itemStatus === "NEW" ? -1 : 1;
                }
                return new Date(a.createdAt) - new Date(b.createdAt);
              })
              .map((item) => (
                <div
                  key={item._id}
                  className={`rounded-lg shadow-lg p-5 border-l-4 transition ${
                    item.itemStatus === "IN_PROGRESS"
                      ? "bg-yellow-900 border-yellow-500"
                      : "bg-red-900 border-red-500"
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white text-xl font-bold">
                        {item.name}
                      </h3>
                      <p className="text-gray-300 text-sm mt-1">
                        Order #{item.orderId?.slice(-4)?.toUpperCase()} • Table{" "}
                        {item.tableName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          item.itemStatus === "IN_PROGRESS"
                            ? "bg-yellow-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {item.itemStatus === "IN_PROGRESS"
                          ? "🔥 COOKING"
                          : "🆕 NEW"}
                      </span>
                    </div>
                  </div>

                  {/* Customization */}
                  {item.meta?.customization && (
                    <div className="bg-gray-800 p-3 rounded mb-3 text-gray-100 text-sm">
                      {item.meta.customization.spiceLevel && (
                        <p>🌶️ Spice: {item.meta.customization.spiceLevel}</p>
                      )}
                      {item.meta.customization.noOnion && <p>❌ No Onion</p>}
                      {item.meta.customization.jain && <p>✓ Jain</p>}
                      {item.meta.customization.notes && (
                        <p>📝 {item.meta.customization.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Quantity */}
                  <p className="text-gray-200 text-lg font-semibold mb-4">
                    Qty:{" "}
                    <span className="text-2xl text-orange-400">
                      {item.quantity}
                    </span>
                  </p>

                  {/* Action Buttons */}
                  {item.itemStatus === "NEW" && (
                    <button
                      onClick={() => claimItem(item._id)}
                      disabled={claimingItemId === item._id}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      Start Cooking
                    </button>
                  )}

                  {item.itemStatus === "IN_PROGRESS" && (
                    <div className="space-y-3">
                      {/* PIN Confirmation for marking ready */}
                      <div className="bg-gray-800 p-3 rounded">
                        <label className="block text-gray-200 text-sm font-semibold mb-2">
                          Confirm with PIN when ready:
                        </label>
                        <input
                          type="password"
                          value={confirmPin}
                          onChange={(e) =>
                            setConfirmPin(e.target.value.slice(0, 4))
                          }
                          placeholder="••••"
                          maxLength="4"
                          className="w-full bg-gray-700 text-white text-center text-2xl font-bold rounded p-3 mb-3"
                        />
                        <button
                          onClick={() => markItemReady(item._id)}
                          disabled={
                            markingReadyItemId === item._id ||
                            confirmPin.length !== 4
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark Ready
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default ChefKitchenApp;
