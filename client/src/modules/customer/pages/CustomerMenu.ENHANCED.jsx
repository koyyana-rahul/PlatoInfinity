/**
 * CustomerMenu.ENHANCED.jsx
 *
 * Enhanced Menu Display Page - Production Ready
 * ✅ Fully responsive (mobile-first)
 * ✅ Error boundaries
 * ✅ Real-time notifications
 * ✅ Better loading states
 * ✅ Touch-friendly interface
 *
 * Uses:
 * - ResponsiveContainer: Page wrapper
 * - ResponsiveGrid: Menu item grid
 * - ResponsiveCard: Item cards
 * - LoadingSpinner: Loading state
 * - ErrorBoundary: Error handling
 * - NotificationCenter: Real-time alerts
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

// API & Store
import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import { useCustomerSocket } from "../hooks/useCustomerSocket";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../../../store/customer/cartThunks";
import {
  selectCartItems,
  selectQuantities,
} from "../../../store/customer/cartSelectors";

// NEW: UI Components
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import ResponsiveContainer from "../../../components/ui/ResponsiveContainer";
import ResponsiveGrid from "../../../components/ui/ResponsiveGrid";
import ResponsiveCard from "../../../components/ui/ResponsiveCard";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import EmptyState from "../../../components/ui/EmptyState";
import ResponsiveText from "../../../components/ui/ResponsiveText";

// EXISTING: Components
import CategoryBar from "../components/CategoryBar";
import SubcategoryFilter from "../components/SubcategoryFilter";
import ItemGrid from "../components/ItemGrid";
import StickyCartBar from "../components/StickyCartBar";
import NotificationCenter from "../../../components/features/NotificationCenter";

/**
 * Menu Page Component - Mobile-first, fully responsive
 */
export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Session & Auth
  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);

  // Menu State
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  // Cart State
  const cartItems = useSelector(selectCartItems);
  const quantities = useSelector(selectQuantities);

  /**
   * Real-time menu update handler
   */
  const handleMenuUpdate = async () => {
    try {
      const res = await Axios(customerApi.publicMenuByTable(tableId));
      setMenu(res.data?.data || []);
      setError(null);
      toast.success("Menu synchronized", {
        icon: "🔄",
        style: { borderRadius: "15px", fontWeight: "bold" },
      });
    } catch (err) {
      console.error("Menu update error:", err);
      setError("Failed to sync menu");
    }
  };

  /**
   * Real-time socket updates
   */
  useCustomerSocket({
    sessionId,
    restaurantId,
    tableId,
    onCartUpdate: () => dispatch(fetchCart()),
    onMenuUpdate: handleMenuUpdate,
  });

  /**
   * Validate session on mount
   */
  useEffect(() => {
    if (!sessionId) {
      navigate(`../`, { replace: true });
      return;
    }
  }, [sessionId, navigate]);

  /**
   * Fetch menu data
   */
  useEffect(() => {
    let active = true;

    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await Axios(customerApi.publicMenuByTable(tableId));
        const data = res.data?.data || [];

        if (!active) return;

        setMenu(data);
        if (data.length) setActiveCat(data[0].id);
        if (res.data?.restaurantId) setRestaurantId(res.data.restaurantId);
      } catch (err) {
        if (!active) return;
        console.error("Menu fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load menu");
        toast.error("Offline: Reconnecting...");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMenu();
    return () => {
      active = false;
    };
  }, [tableId]);

  /**
   * Fetch cart data
   */
  useEffect(() => {
    if (sessionId) {
      dispatch(fetchCart());
    }
  }, [dispatch, sessionId]);

  /**
   * Get current category
   */
  const category = useMemo(
    () => menu.find((c) => c.id === activeCat),
    [menu, activeCat],
  );

  /**
   * Get filtered items based on category & subcategory
   */
  const items = useMemo(() => {
    if (!category) return [];
    if (!activeSub) return category.subcategories.flatMap((s) => s.items);
    return category.subcategories.find((s) => s.id === activeSub)?.items || [];
  }, [category, activeSub]);

  /**
   * Handle category change
   */
  const handleCategoryChange = (id) => {
    setActiveCat(id);
    setActiveSub(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Handle add to cart
   */
  const handleAddItem = (id) => {
    dispatch(addToCart({ branchMenuItemId: id, quantity: 1 }));
    toast.success("Added to cart", {
      icon: "✨",
      duration: 2000,
    });
  };

  /**
   * Handle remove from cart
   */
  const handleRemoveItem = (id) => {
    const item = cartItems.find((i) => i.branchMenuItemId === id);
    if (!item) return;

    if (item.quantity <= 1) {
      dispatch(removeCartItem(item._id));
      toast.success("Removed from cart");
    } else {
      dispatch(
        updateCartItem({
          cartItemId: item._id,
          quantity: item.quantity - 1,
        }),
      );
    }
  };

  /**
   * Handle retry
   */
  const handleRetry = async () => {
    setRetrying(true);
    try {
      await handleMenuUpdate();
    } finally {
      setRetrying(false);
    }
  };

  // 🔴 LOADING STATE
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <LoadingSpinner size="lg" message="Loading Menu..." />
        <p className="mt-4 text-xs text-slate-400 font-medium">
          Fetching items from kitchen...
        </p>
      </div>
    );
  }

  // 🟥 ERROR STATE
  if (error && !menu.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Menu"
          message={error}
          action={{
            label: "Try Again",
            onClick: handleRetry,
          }}
        />
      </div>
    );
  }

  // 🟨 NO ITEMS STATE
  if (!menu.length && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <EmptyState
          icon={AlertCircle}
          title="No Menu Available"
          message="The kitchen menu is currently unavailable. Please try again later."
          action={{
            label: "Refresh",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  // ✅ MAIN CONTENT
  return (
    <ErrorBoundary>
      {/* Real-time notification system */}
      <NotificationCenter restaurantId={restaurantId} />

      <ResponsiveContainer>
        {/* PAGE HEADER */}
        <div className="py-4 sm:py-6 border-b border-slate-200/50">
          <ResponsiveText variant="heading1">Menu</ResponsiveText>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {items.length} items • Table #{tableId}
          </p>
        </div>

        {/* ERROR BANNER (if exists but can recover) */}
        {error && menu.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-yellow-900">
                Menu may be out of sync
              </p>
              <p className="text-xs text-yellow-700 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="text-yellow-700 hover:text-yellow-900 ml-2 flex-shrink-0"
            >
              {retrying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </motion.div>
        )}

        {/* CATEGORY BAR - Sticky scroll */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-10 px-4 sm:px-6 md:px-8 lg:px-10 py-3 border-b border-slate-100/50 mt-6 sm:mt-8">
          <CategoryBar
            categories={menu}
            activeId={activeCat}
            onSelect={handleCategoryChange}
          />
        </div>

        {/* SUBCATEGORY FILTER */}
        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 overflow-hidden">
          <SubcategoryFilter
            subcategories={category?.subcategories || []}
            activeId={activeSub}
            onSelect={setActiveSub}
          />
        </div>

        {/* ITEMS GRID - Responsive layout */}
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key={activeSub || activeCat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ItemGrid
                items={items}
                quantities={quantities}
                onAdd={handleAddItem}
                onMinus={handleRemoveItem}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-12 sm:py-16"
            >
              <EmptyState
                icon={AlertCircle}
                title="No Items in This Category"
                message="Try selecting a different category or subcategory"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM PADDING for sticky cart */}
        <div className="h-24 sm:h-32" />
      </ResponsiveContainer>

      {/* STICKY CART BAR */}
      <StickyCartBar />
    </ErrorBoundary>
  );
}
