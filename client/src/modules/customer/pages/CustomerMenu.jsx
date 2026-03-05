import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import { useCustomerSocket } from "../hooks/useCustomerSocket";

import AdminCategoryBar from "../../admin/master-menu/CategoryBar";
import AdminSubcategoryBar from "../../admin/master-menu/SubcategoryBar";
import ItemGrid from "../components/ItemGrid";
import StickyCartBar from "../components/StickyCartBar";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

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
  const [vegFilter, setVegFilter] = useState("all");

  const cartItems = useSelector(selectCartItems);
  const quantities = useSelector(selectQuantities);

  const normalizeId = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
    }
    return String(value);
  };

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
    onCartUpdate: () => dispatch(fetchCart({ tableId })),
    onMenuUpdate: handleMenuUpdate,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [menuRes, tableRes] = await Promise.all([
          Axios(customerApi.publicMenuByTable(tableId)),
          Axios(customerApi.publicTable(tableId)),
        ]);
        const data = menuRes.data?.data || [];
        if (!active) return;
        setMenu(data);
        if (data.length) setActiveCat(data[0].id);
        if (tableRes.data?.data?.restaurantId) {
          setRestaurantId(tableRes.data.data.restaurantId);
        }
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
    dispatch(fetchCart({ tableId }));
  }, [dispatch, tableId]);

  const category = useMemo(
    () => menu.find((c) => c.id === activeCat),
    [menu, activeCat],
  );

  const items = useMemo(() => {
    if (!category) return [];
    if (!activeSub) return category.subcategories.flatMap((s) => s.items);
    return category.subcategories.find((s) => s.id === activeSub)?.items || [];
  }, [category, activeSub]);

  const visibleItems = useMemo(() => {
    if (vegFilter === "veg") return items.filter((i) => i.isVeg);
    if (vegFilter === "nonveg") return items.filter((i) => !i.isVeg);
    return items;
  }, [items, vegFilter]);

  const isEmpty = !loading && visibleItems.length === 0;

  useEffect(() => {
    if (!isEmpty) return undefined;
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehaviorY;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehaviorY = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehaviorY = originalOverscroll;
    };
  }, [isEmpty]);

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
    <div
      className={clsx(
        "relative min-h-screen bg-transparent flex flex-col selection:bg-orange-100 font-sans tracking-tight text-slate-900",
        isEmpty && "h-screen overflow-hidden overscroll-none",
      )}
    >
      {/* ================= STATIONARY TOP REGION ================= */}
      <div className="sticky top-0 z-30 w-full">
        {/* LAYER 1: MAIN HEADER */}
        <header className="bg-white/95 backdrop-blur-xl w-full shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <h1 className="text-lg sm:text-xl font-[800] text-black tracking-tight leading-none">
                Menu
              </h1>
              <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-full startup-shadow">
                <div className="h-1.5 w-1.5 rounded-full bg-[#F35C2B] animate-pulse" />
                <p className="text-[8px] font-bold text-[#F35C2B] uppercase tracking-widest">
                  Live
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-wrap bg-slate-100 rounded-full p-1 shrink-0 gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "veg", label: "Veg", isVeg: true },
                  { id: "nonveg", label: "Non", isVeg: false },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVegFilter(v.id)}
                    className={clsx(
                      "px-3 py-1.5 text-[10px] font-bold rounded-full transition-all duration-200 flex items-center gap-1 active:scale-95",
                      vegFilter === v.id
                        ? "bg-[#F35C2B] text-white shadow-[0_10px_25px_-15px_rgba(243,92,43,0.6)]"
                        : "text-slate-500 hover:text-black",
                    )}
                  >
                    {v.isVeg !== undefined && (
                      <VegNonVegIcon isVeg={v.isVeg} size={6} />
                    )}
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* LAYER 2: CATEGORY NAVIGATION */}
        <div className="bg-white/95 backdrop-blur-xl w-full shadow-[0_10px_30px_-26px_rgba(15,23,42,0.35)]">
          <div className="max-w-7xl mx-auto">
            <AdminCategoryBar
              categories={menu}
              activeCategoryId={activeCat}
              onSelect={(id) => {
                setActiveCat(id);
                setActiveSub(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE CONTENT REGION ================= */}
      <main
        id="browse"
        className={clsx(
          "flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-0 py-3 sm:py-4 space-y-3 sm:space-y-4",
          isEmpty && "overflow-hidden pb-2 h-[calc(100vh-200px)]",
        )}
      >
        {/* SUBCATEGORY FILTER */}
        <div className="mt-0 overflow-hidden">
          <AdminSubcategoryBar
            subcategories={category?.subcategories || []}
            activeSubcategoryId={activeSub}
            onSelect={setActiveSub}
            disableExpand
          />
        </div>

        {/* ITEM GRID */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeSub || "all"}-${vegFilter}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ItemGrid
              items={visibleItems}
              quantities={quantities}
              onAdd={(id) =>
                dispatch(addToCart({ branchMenuItemId: id, quantity: 1 }))
              }
              onMinus={(id) => {
                const item = cartItems.find(
                  (i) => normalizeId(i.branchMenuItemId) === normalizeId(id),
                );
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
      </main>

      {/* GLOBAL CART BUTTON */}
      <StickyCartBar />
    </div>
  );
}
