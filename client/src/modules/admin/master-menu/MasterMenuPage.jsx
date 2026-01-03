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
import CreateItemModal from "./modals/CreateItemModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import CreateSubcategoryModal from "./modals/CreateSubcategoryModal";
import EditSubcategoryModal from "./modals/EditSubcategoryModal";
/* ================= HELPERS ================= */
const getAllCategoryItems = (category) => {
  if (!category) return [];
  return [
    ...(category.items || []),
    ...(category.subcategories?.flatMap((s) => s.items || []) || []),
  ];
};

export default function MasterMenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);

  const [vegFilter, setVegFilter] = useState("all");
  const [modal, setModal] = useState({ type: null, data: null });

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= API ================= */
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

  /* ================= DERIVED ================= */
  const activeCategory = useMemo(
    () => menu.find((c) => c.id === activeCategoryId),
    [menu, activeCategoryId]
  );

  const subcategories = activeCategory?.subcategories || [];
  const activeSubcategory =
    subcategories.find((s) => s.id === activeSubcategoryId) || null;

  const visibleItems = useMemo(() => {
    if (!activeCategory) return [];
    const items =
      activeSubcategoryId === null
        ? getAllCategoryItems(activeCategory)
        : activeSubcategory?.items || [];

    if (vegFilter === "veg") return items.filter((i) => i.isVeg);
    if (vegFilter === "nonveg") return items.filter((i) => !i.isVeg);
    return items;
  }, [activeCategory, activeSubcategoryId, vegFilter]);

  const closeModal = () => setModal({ type: null, data: null });

  /* ================= DELETE ================= */
  const confirmAndDelete = ({ title, description, action }) => {
    setConfirmDelete({ title, description, action });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      await confirmDelete.action();
      toast.success("Deleted successfully");
      setConfirmDelete(null);
      loadMenu();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col">
      {/* ================= HEADER (STICKY) ================= */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-md">
              <UtensilsCrossed size={18} />
            </div>
            <span className="text-sm font-medium">Master Menu</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-full p-1">
              {[
                { id: "all", icon: <Filter size={12} /> },
                { id: "veg", icon: <Leaf size={12} /> },
                { id: "nonveg", icon: <Flame size={12} /> },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVegFilter(v.id)}
                  className={`px-3 py-1.5 text-[11px] rounded-full ${
                    vegFilter === v.id ? "bg-black text-white" : "text-gray-500"
                  }`}
                >
                  {v.icon}
                </button>
              ))}
            </div>

            <button
              onClick={() => setModal({ type: "category" })}
              className="bg-black text-white px-4 py-2 rounded-md text-xs"
            >
              <Plus size={12} />
              <p>Category</p>
            </button>
          </div>
        </div>
      </header>

      {/* ================= CATEGORY BAR (STICKY) ================= */}
      <div className="sticky top-[56px] z-40 bg-white border-b">
        <div className="px-2 py-1">
          <CategoryBar
            categories={menu}
            activeCategoryId={activeCategoryId}
            onSelect={(id) => {
              setActiveCategoryId(id);
              setActiveSubcategoryId(null);
            }}
            onEdit={(cat) => setModal({ type: "editCategory", data: cat })}
            onDelete={(id) =>
              confirmAndDelete({
                title: "Delete Category",
                description:
                  "This will permanently delete the category and all its items.",
                action: () => Axios(masterMenuApi.deleteCategory(id)),
              })
            }
          />
        </div>
      </div>

      {/* ================= SUBCATEGORY BAR (STICKY) ================= */}
      <div className="sticky top-[108px] z-30 bg-[#eeeeee] border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <SubcategoryBar
            subcategories={subcategories}
            activeSubcategoryId={activeSubcategoryId}
            onSelect={setActiveSubcategoryId}
            onAdd={() =>
              setModal({ type: "subcategory", data: activeCategory.id })
            }
            onEdit={(sub) => setModal({ type: "editSubcategory", data: sub })}
            onDelete={(id) =>
              confirmAndDelete({
                title: "Delete Section",
                description: "All items inside this section will be deleted.",
                action: () => Axios(masterMenuApi.deleteSubcategory(id)),
              })
            }
          />
        </div>
      </div>

      {/* ================= ITEM GRID ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-3 pb-24">
        <ItemGrid
          title={activeSubcategoryId === null ? "All" : activeSubcategory?.name}
          items={visibleItems}
          isAllSection={activeSubcategoryId === null}
          onAddItem={() =>
            setModal({
              type: "item",
              data: {
                categoryId: activeCategory.id,
                subcategoryId: activeSubcategoryId,
              },
            })
          }
          onDeleteItem={(id) =>
            confirmAndDelete({
              title: "Delete Item",
              description: "This item will be permanently removed from menu.",
              action: () => Axios(masterMenuApi.deleteItem(id)),
            })
          }
          refresh={loadMenu}
        />
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
        <EditSubcategoryModal
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

      <ConfirmDeleteModal
        open={!!confirmDelete}
        title={confirmDelete?.title}
        description={confirmDelete?.description}
        loading={deleteLoading}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
