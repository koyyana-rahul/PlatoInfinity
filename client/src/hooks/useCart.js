/**
 * useCart.js
 *
 * Custom React hook for cart management:
 * - Add/remove/update items
 * - Real-time sync in FAMILY mode
 * - Idempotent operations
 * - Error recovery
 */

import { useState, useCallback, useEffect } from "react";
import Axios from "../api/axios";
import customerApi from "../api/customer.api";
import toast from "react-hot-toast";
import { socketService } from "../api/socket.service";

export function useCart(sessionId, restaurantId, sessionMode = "FAMILY") {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  /* ========== CALCULATE TOTALS ========== */
  const calculateTotals = useCallback((items) => {
    const itemCount = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const price = items.reduce((sum, item) => {
      const modifierPrice = (item.selectedModifiers || []).reduce(
        (m_sum, mod) => m_sum + (mod.price || 0),
        0,
      );
      return sum + (item.price + modifierPrice) * (item.quantity || 0);
    }, 0);

    setTotalItems(itemCount);
    setTotalPrice(price);
  }, []);

  /* ========== FETCH CART ========== */
  const fetchCart = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const res = await Axios(customerApi.cart.get);

      const items = res.data?.data || [];
      setCart(items);
      calculateTotals(items);

      console.log(`📦 Cart fetched: ${items.length} items`);
    } catch (err) {
      console.error("❌ Failed to fetch cart:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [sessionId, calculateTotals]);

  /* ========== ADD TO CART ========== */
  const addToCart = useCallback(
    async (menuItemId, quantity = 1, modifiers = []) => {
      try {
        setLoading(true);

        const res = await Axios({
          ...customerApi.cart.add,
          data: {
            restaurantId,
            sessionId,
            branchMenuItemId: menuItemId,
            quantity,
            selectedModifiers: modifiers,
          },
        });

        const updatedCart = res.data?.data || [];
        setCart(updatedCart);
        calculateTotals(updatedCart);

        toast.success(`Added to cart`);

        // Broadcast to other devices in FAMILY mode
        if (sessionMode === "FAMILY") {
          socketService.broadcastCartUpdate(updatedCart);
        }

        return true;
      } catch (err) {
        console.error("❌ Failed to add to cart:", err);
        toast.error(
          err?.response?.data?.message || "Failed to add item to cart",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, restaurantId, sessionMode, calculateTotals],
  );

  /* ========== UPDATE CART ITEM ========== */
  const updateCartItem = useCallback(
    async (itemId, quantity) => {
      if (quantity < 0) {
        return removeFromCart(itemId);
      }

      if (quantity === 0) {
        return removeFromCart(itemId);
      }

      try {
        setLoading(true);

        const res = await Axios({
          ...customerApi.cart.update,
          data: {
            itemId,
            quantity,
          },
        });

        const updatedCart = res.data?.data || [];
        setCart(updatedCart);
        calculateTotals(updatedCart);

        // Broadcast to other devices in FAMILY mode
        if (sessionMode === "FAMILY") {
          socketService.broadcastCartUpdate(updatedCart);
        }

        return true;
      } catch (err) {
        console.error("❌ Failed to update cart:", err);
        toast.error("Failed to update item quantity");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessionMode, calculateTotals],
  );

  /* ========== REMOVE FROM CART ========== */
  const removeFromCart = useCallback(
    async (itemId) => {
      try {
        setLoading(true);

        const res = await Axios(customerApi.cart.remove(itemId));

        const updatedCart = res.data?.data || [];
        setCart(updatedCart);
        calculateTotals(updatedCart);

        toast.success("Item removed from cart");

        // Broadcast to other devices in FAMILY mode
        if (sessionMode === "FAMILY") {
          socketService.broadcastCartUpdate(updatedCart);
        }

        return true;
      } catch (err) {
        console.error("❌ Failed to remove from cart:", err);
        toast.error("Failed to remove item");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessionMode, calculateTotals],
  );

  /* ========== CLEAR CART ========== */
  const clearCart = useCallback(async () => {
    try {
      await Axios(customerApi.cart.clear);
      setCart([]);
      setTotalItems(0);
      setTotalPrice(0);

      toast.success("Cart cleared");

      // Broadcast to other devices in FAMILY mode
      if (sessionMode === "FAMILY") {
        socketService.broadcastCartUpdate([]);
      }

      return true;
    } catch (err) {
      console.error("❌ Failed to clear cart:", err);
      toast.error("Failed to clear cart");
      return false;
    }
  }, [sessionMode]);

  /* ========== LISTEN FOR REAL-TIME UPDATES (FAMILY MODE) ========== */
  useEffect(() => {
    if (sessionMode === "FAMILY") {
      socketService.onCartUpdated((updatedCart) => {
        console.log("📡 Cart synced from another device");
        setCart(updatedCart);
        calculateTotals(updatedCart);
      });

      return () => {
        socketService.offCartUpdated();
      };
    }
  }, [sessionMode, calculateTotals]);

  /* ========== INITIAL LOAD ========== */
  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId, fetchCart]);

  return {
    cart,
    totalItems,
    totalPrice,
    loading,

    // Methods
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}

export default useCart;
