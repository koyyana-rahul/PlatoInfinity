import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import { useCustomerSocket } from "../hooks/useCustomerSocket";

import CategoryBar from "../components/CategoryBar";
import SubcategoryFilter from "../components/SubcategoryFilter";
import ItemGrid from "../components/ItemGrid";
import StickyCartBar from "../components/StickyCartBar";

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

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  const cartItems = useSelector(selectCartItems);
  const quantities = useSelector(selectQuantities);

  // Real-time Update Handler
  const handleMenuUpdate = async () => {
    try {
      const res = await Axios(customerApi.publicMenuByTable(tableId));
      setMenu(res.data?.data || []);
      toast.success("Menu synchronized", {
        icon: "🔄",
        style: { borderRadius: "15px", fontWeight: "bold" },
      });
    } catch (err) {
      console.error(err);
    }
  };

  useCustomerSocket({
    sessionId,
    restaurantId,
    tableId,
    onCartUpdate: () => dispatch(fetchCart()),
    onMenuUpdate: handleMenuUpdate,
  });

  useEffect(() => {
    if (!sessionId) navigate(`../`, { replace: true });
  }, [sessionId, navigate]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await Axios(customerApi.publicMenuByTable(tableId));
        const data = res.data?.data || [];
        if (!active) return;
        setMenu(data);
        if (data.length) setActiveCat(data[0].id);
        if (res.data?.restaurantId) setRestaurantId(res.data.restaurantId);
      } catch {
        toast.error("Offline: Reconnecting...");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tableId]);

  useEffect(() => {
    if (sessionId) dispatch(fetchCart());
  }, [dispatch, sessionId]);

  const category = useMemo(
    () => menu.find((c) => c.id === activeCat),
    [menu, activeCat],
  );

  const items = useMemo(() => {
    if (!category) return [];
    if (!activeSub) return category.subcategories.flatMap((s) => s.items);
    return category.subcategories.find((s) => s.id === activeSub)?.items || [];
  }, [category, activeSub]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Loading Menu
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 1. STICKY CATEGORY BAR - Locked to top during scroll */}
      <div className="sticky top-0 z-[50] bg-white/95 backdrop-blur-md border-b border-slate-50 pt-2">
        <CategoryBar
          categories={menu}
          activeId={activeCat}
          onSelect={(id) => {
            setActiveCat(id);
            setActiveSub(null);
            window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth reset on change
          }}
        />
      </div>

      <div className="px-5">
        {/* 2. SUBCATEGORY FILTER - Standard scroll (Non-sticky) */}
        <div className="mt-6 mb-8 overflow-hidden">
          <SubcategoryFilter
            subcategories={category?.subcategories || []}
            activeId={activeSub}
            onSelect={setActiveSub}
          />
        </div>

        {/* 3. ITEM GRID - With staggered entrance animation */}
        <AnimatePresence mode="wait">
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
              onAdd={(id) =>
                dispatch(addToCart({ branchMenuItemId: id, quantity: 1 }))
              }
              onMinus={(id) => {
                const item = cartItems.find((i) => i.branchMenuItemId === id);
                if (!item) return;
                item.quantity <= 1
                  ? dispatch(removeCartItem(item._id))
                  : dispatch(
                      updateCartItem({
                        cartItemId: item._id,
                        quantity: item.quantity - 1,
                      }),
                    );
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. GLOBAL CART BUTTON */}
      <StickyCartBar />
    </div>
  );
}
