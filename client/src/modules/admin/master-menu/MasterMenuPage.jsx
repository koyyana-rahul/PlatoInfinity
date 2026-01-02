import { useEffect, useMemo, useState } from "react";
import { Plus, UtensilsCrossed, Leaf, Flame, Filter } from "lucide-react";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import masterMenuApi from "../../../api/masterMenu.api";

import CategoryBar from "./CategoryBar";
import SubcategoryBar from "./SubcategoryBar";
import ItemGrid from "./ItemGrid";

import CreateCategoryModal from "./modals/CreateCategoryModal";
import EditCategoryModal from "./modals/EditCategoryModal";
import CreateSubcategoryModal from "./modals/CreateSubCategoryModal";
import EditSubCategoryModal from "./modals/EditSubCategoryModal";
import CreateItemModal from "./modals/CreateItemModal";

/* 🔥 Collect ALL items under a category */
const getAllCategoryItems = (category) => {
  if (!category) return [];
  const direct = category.items || [];
  const fromSubs = category.subcategories?.flatMap((s) => s.items || []) || [];
  return [...direct, ...fromSubs];
};

export default function MasterMenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(null); // null = ALL

  const [vegFilter, setVegFilter] = useState("all");
  const [modal, setModal] = useState({ type: null, data: null });

  /* ---------------- API ---------------- */

  const loadMenu = async () => {
    try {
      setLoading(true);
      const res = await Axios(masterMenuApi.tree);
      const data = res.data?.data || [];
      setMenu(data);

      if (!activeCategoryId && data.length) {
        setActiveCategoryId(data[0].id);
        setActiveSubcategoryId(null);
      }
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  /* ---------------- DERIVED ---------------- */

  const activeCategory = useMemo(
    () => menu.find((c) => c.id === activeCategoryId),
    [menu, activeCategoryId]
  );

  const subcategories = activeCategory?.subcategories || [];
  const activeSubcategory =
    subcategories.find((s) => s.id === activeSubcategoryId) || null;

  const isAllSection = activeSubcategoryId === null;

  const filterItems = (items = []) => {
    if (vegFilter === "veg") return items.filter((i) => i.isVeg);
    if (vegFilter === "nonveg") return items.filter((i) => !i.isVeg);
    return items;
  };

  const visibleItems = useMemo(() => {
    if (!activeCategory) return [];
    const items = isAllSection
      ? getAllCategoryItems(activeCategory)
      : activeSubcategory?.items || [];
    return filterItems(items);
  }, [activeCategory, activeSubcategory, isAllSection, vegFilter]);

  const closeModal = () => setModal({ type: null, data: null });

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-xl">
              <UtensilsCrossed size={18} />
            </div>
            <h1 className="font-black uppercase text-sm">Master Menu</h1>
          </div>

          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-full p-1">
              {[
                { id: "all", icon: <Filter size={12} /> },
                { id: "veg", icon: <Leaf size={12} /> },
                { id: "nonveg", icon: <Flame size={12} /> },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVegFilter(v.id)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-full flex items-center gap-1
                    ${
                      vegFilter === v.id
                        ? "bg-black text-white"
                        : "text-gray-500"
                    }`}
                >
                  {v.icon}
                </button>
              ))}
            </div>

            {/* ✅ ADD CATEGORY */}
            <button
              onClick={() => setModal({ type: "category" })}
              className="bg-black text-white px-3 py-2 rounded-xl text-[10px] font-black flex items-center gap-1"
            >
              <Plus size={12} /> Category
            </button>
          </div>
        </div>
      </header>

      {/* CATEGORY BAR */}
      <CategoryBar
        categories={menu}
        activeCategoryId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setActiveSubcategoryId(null);
        }}
      />

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-4 pb-32">
        {!loading && activeCategory && (
          <>
            <SubcategoryBar
              subcategories={subcategories}
              activeSubcategoryId={activeSubcategoryId}
              onSelect={setActiveSubcategoryId}
              onAdd={() =>
                setModal({
                  type: "subcategory",
                  data: activeCategory.id,
                })
              }
            />

            <ItemGrid
              title={isAllSection ? "All Items" : activeSubcategory?.name}
              items={visibleItems}
              isAllSection={isAllSection}
              onAddItem={() =>
                setModal({
                  type: "item",
                  data: {
                    categoryId: activeCategory.id,
                    subcategoryId: isAllSection ? null : activeSubcategory.id,
                  },
                })
              }
              refresh={loadMenu}
            />
          </>
        )}
      </main>

      {/* ================= MODALS ================= */}

      {modal.type === "category" && (
        <CreateCategoryModal onClose={closeModal} onSuccess={loadMenu} />
      )}

      {modal.type === "editCategory" && (
        <EditCategoryModal
          category={modal.data}
          onClose={closeModal}
          onSuccess={loadMenu}
        />
      )}

      {modal.type === "subcategory" && (
        <CreateSubcategoryModal
          categoryId={modal.data}
          onClose={closeModal}
          onSuccess={loadMenu}
        />
      )}

      {modal.type === "editSubcategory" && (
        <EditSubCategoryModal
          subcategory={modal.data}
          onClose={closeModal}
          onSuccess={loadMenu}
        />
      )}

      {modal.type === "item" && (
        <CreateItemModal
          categoryId={modal.data.categoryId}
          subcategoryId={modal.data.subcategoryId}
          onClose={closeModal}
          onSuccess={loadMenu}
        />
      )}
    </div>
  );
}
