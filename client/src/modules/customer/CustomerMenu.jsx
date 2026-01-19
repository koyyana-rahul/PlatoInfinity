import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

import CustomerCategoryBar from "./components/CustomerCategoryBar";
import CustomerSubcategoryBar from "./components/CustomerSubcategoryBar";
import CustomerItemGrid from "./components/CustomerItemGrid";

export default function CustomerMenu() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;
  const sessionKey = `plato:customerSession:${tableId}`;
  const joined = Boolean(localStorage.getItem(sessionKey));

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);

  /* ================= LOAD MENU ================= */
  const loadMenu = async () => {
    try {
      setLoading(true);

      const res = await Axios(
        customerApi.publicMenuByTable(tableId, vegOnly ? { veg: true } : {}),
      );

      const data = res.data?.data || [];
      setMenu(data);

      // ✅ SAFE DEFAULT CATEGORY
      if (data.length) {
        setActiveCategoryId((prev) => prev || data[0].id);
        setActiveSubcategoryId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load menu");
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [tableId, vegOnly]);

  /* ================= DERIVED ================= */
  const activeCategory = useMemo(
    () => menu.find((c) => c.id === activeCategoryId),
    [menu, activeCategoryId],
  );

  const subcategories = activeCategory?.subcategories || [];

  const activeSubcategory = useMemo(
    () => subcategories.find((s) => s.id === activeSubcategoryId) || null,
    [subcategories, activeSubcategoryId],
  );

  const visibleItems = useMemo(() => {
    if (!activeCategory) return [];

    // ✅ ALWAYS SHOW ITEMS
    if (!activeSubcategoryId) {
      return [
        ...(activeCategory.items || []),
        ...(activeCategory.subcategories?.flatMap((s) => s.items) || []),
      ];
    }

    return activeSubcategory?.items || [];
  }, [activeCategory, activeSubcategoryId, activeSubcategory]);

  /* ================= ADD TO CART ================= */
  const addToCart = async (itemId) => {
    if (!joined) {
      toast.error("Please join table session first");
      navigate(base);
      return;
    }

    try {
      await Axios({
        ...customerApi.cart.add,
        data: { branchMenuItemId: itemId, quantity: 1 },
      });
      toast.success("Added to cart");
    } catch {
      toast.error("Unable to add item");
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />;
  }

  if (!menu.length) {
    return (
      <div className="bg-white border rounded-xl p-6 text-gray-600">
        No items available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= FILTER HEADER ================= */}
      <div className="sticky top-16 z-30 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Menu</h1>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
            />
            Veg only
          </label>
        </div>
      </div>

      {/* ================= CATEGORY BAR ================= */}
      <CustomerCategoryBar
        categories={menu}
        activeCategoryId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setActiveSubcategoryId(null);
        }}
      />

      {/* ================= CONTENT ================= */}
      <main className="max-w-6xl mx-auto w-full px-4 py-4 space-y-5">
        {/* SUBCATEGORIES */}
        {subcategories.length > 0 && (
          <CustomerSubcategoryBar
            subcategories={subcategories}
            activeSubcategoryId={activeSubcategoryId}
            onSelect={setActiveSubcategoryId}
          />
        )}

        {/* ITEMS */}
        <CustomerItemGrid
          title={
            activeSubcategoryId ? activeSubcategory?.name : activeCategory?.name
          }
          items={visibleItems}
          onAdd={addToCart}
        />
      </main>
    </div>
  );
}
