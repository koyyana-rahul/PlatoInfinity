import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Layout,
  CheckCircle,
  Sparkles,
  CloudCheck,
  Settings2,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

import Axios from "../../../api/axios";
import masterMenuApi from "../../../api/masterMenu.api";

import CategoryBar from "./CategoryBar";
import SubcategoryBar from "./SubcategoryBar";
import ItemGrid from "./ItemGrid";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

import CreateCategoryModal from "./modals/CreateCategoryModal";
import EditCategoryModal from "./modals/EditCategoryModal";
import CreateItemModal from "./modals/CreateItemModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import CreateSubcategoryModal from "./modals/CreateSubcategoryModal";
import EditSubcategoryModal from "./modals/EditSubcategoryModal";

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
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      toast.error("Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const activeCategory = useMemo(
    () => menu.find((c) => c.id === activeCategoryId),
    [menu, activeCategoryId],
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

  const executeDelete = async () => {
    try {
      setDeleteLoading(true);
      await confirmDelete.action();
      toast.success("Successfully removed");
      setConfirmDelete(null);
      loadMenu();
    } catch {
      toast.error("Operation failed.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmAndDelete = ({
    title,
    description,
    action,
    confirmText,
    targetLabel,
    impact,
  }) => {
    setConfirmDelete({
      title,
      description,
      action,
      confirmText,
      targetLabel,
      impact,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= STATIONARY TOP REGION ================= */}
      <div className="sticky top-0 z-30 w-full bg-white shadow-md">
        {/* LAYER 1: MAIN HEADER */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 whitespace-nowrap">
                Master Menu
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-lg border border-green-200">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-medium text-green-700">Live</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-gray-100 rounded-lg p-1.5 border border-gray-200 gap-1 flex-wrap sm:flex-nowrap">
                {[
                  { id: "all", label: "All" },
                  { id: "veg", label: "Veg", isVeg: true },
                  { id: "nonveg", label: "Non-Veg", isVeg: false },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVegFilter(v.id)}
                    className={clsx(
                      "px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap",
                      vegFilter === v.id
                        ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white shadow-md"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-200",
                    )}
                  >
                    {v.isVeg !== undefined && (
                      <VegNonVegIcon isVeg={v.isVeg} size={7} />
                    )}
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setModal({ type: "category" })}
                className="bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline text-sm font-semibold">
                  Add
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* LAYER 2: CATEGORY NAVIGATION */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
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
                  title: "Delete Category?",
                  description:
                    "This will permanently remove the category and all its items.",
                  confirmText: "Delete Category",
                  targetLabel:
                    menu.find((c) => c.id === id)?.name || "Category",
                  impact:
                    "All sections and items inside this category will be deleted.",
                  action: () => Axios(masterMenuApi.deleteCategory(id)),
                })
              }
            />
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE CONTENT REGION ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6">
        {/* SECTION NAVIGATION */}
        {activeCategory && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Layout size={14} className="text-[#FC8019]" />
              <p className="text-xs font-medium text-gray-600">
                {activeCategory.name} Sections
              </p>
            </div>
            <SubcategoryBar
              subcategories={subcategories}
              activeSubcategoryId={activeSubcategoryId}
              onSelect={setActiveSubcategoryId}
              onAdd={() =>
                setModal({ type: "subcategory", data: activeCategory.id })
              }
              onEdit={(sub) => setModal({ type: "editSubcategory", data: sub })}
              onDelete={(sub) => {
                const itemCount = sub?.items?.length || 0;
                const title = itemCount
                  ? "Delete Section & All Items?"
                  : "Delete Section?";
                const description = itemCount
                  ? `This will permanently delete this section and all ${itemCount} items inside it.`
                  : "This will permanently delete this section.";
                const impact = itemCount
                  ? "All items inside this section will be removed."
                  : null;

                confirmAndDelete({
                  title,
                  description,
                  confirmText: itemCount
                    ? "Delete Section + Items"
                    : "Delete Section",
                  targetLabel: sub?.name || "Section",
                  impact,
                  action: () => Axios(masterMenuApi.deleteSubcategory(sub.id)),
                });
              }}
            />
          </div>
        )}

        {/* ITEMS REGISTRY */}
        <div className="pb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#FC8019] rounded-full" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {activeSubcategoryId === null
                  ? "All Items"
                  : activeSubcategory?.name}
              </h3>
              <span className="text-xs font-medium text-gray-500">
                ({visibleItems.length})
              </span>
            </div>
          </div>

          <ItemGrid
            items={visibleItems}
            isAllSection={activeSubcategoryId === null}
            onAddItem={() =>
              setModal({
                type: "item",
                data: {
                  categoryId: activeCategory?.id,
                  subcategoryId: activeSubcategoryId,
                },
              })
            }
            onDeleteItem={(item) =>
              confirmAndDelete({
                title: "Delete Item?",
                description:
                  "This item will be permanently removed from the menu.",
                confirmText: "Delete Item",
                targetLabel: item?.name || "Item",
                action: () =>
                  Axios(masterMenuApi.deleteItem(item?.id || item?._id)),
              })
            }
            refresh={loadMenu}
          />
        </div>
      </main>

      {/* ================= MODALS & OVERLAYS ================= */}
      {modal?.type === "category" && (
        <CreateCategoryModal
          onClose={() => setModal(null)}
          onSuccess={loadMenu}
        />
      )}
      {modal?.type === "editCategory" && (
        <EditCategoryModal
          category={modal.data}
          onClose={() => setModal(null)}
          onSuccess={loadMenu}
        />
      )}
      {modal?.type === "subcategory" && (
        <CreateSubcategoryModal
          categoryId={modal.data}
          onClose={() => setModal(null)}
          onSuccess={loadMenu}
        />
      )}
      {modal?.type === "editSubcategory" && (
        <EditSubcategoryModal
          subcategory={modal.data}
          onClose={() => setModal(null)}
          onSuccess={loadMenu}
        />
      )}
      {modal?.type === "item" && (
        <CreateItemModal
          categoryId={modal.data.categoryId}
          subcategoryId={modal.data.subcategoryId}
          onClose={() => setModal(null)}
          onSuccess={loadMenu}
        />
      )}

      <ConfirmDeleteModal
        open={!!confirmDelete}
        title={confirmDelete?.title}
        description={confirmDelete?.description}
        confirmText={confirmDelete?.confirmText}
        targetLabel={confirmDelete?.targetLabel}
        impact={confirmDelete?.impact}
        loading={deleteLoading}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
