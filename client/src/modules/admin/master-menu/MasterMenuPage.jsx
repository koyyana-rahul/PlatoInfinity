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

  const confirmAndDelete = ({ title, description, action }) => {
    setConfirmDelete({ title, description, action });
  };

  return (
    <div className="relative min-h-screen bg-[#F2F2F7] flex flex-col selection:bg-emerald-100 font-sans tracking-tight">
      {/* ================= STATIONARY TOP REGION ================= */}
      <div className="sticky top-0 z-30 w-full">
        {/* LAYER 1: MAIN HEADER */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-black/[0.05] w-full shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <h1 className="text-lg sm:text-xl font-[800] text-black tracking-tight leading-none">
                Menu Setup
              </h1>
              <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100/50">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[7px] font-bold text-emerald-700 uppercase tracking-widest">
                  Live
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#787880]/[0.1] rounded-lg p-0.5 shrink-0">
                {[
                  { id: "all", label: "All" },
                  { id: "veg", label: "Veg", isVeg: true },
                  { id: "nonveg", label: "Non", isVeg: false },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVegFilter(v.id)}
                    className={clsx(
                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200 flex items-center gap-1",
                      vegFilter === v.id
                        ? "bg-white text-black shadow-sm"
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

              <button
                onClick={() => setModal({ type: "category" })}
                className="bg-emerald-500 text-white p-2 sm:px-3 sm:py-1.5 rounded-lg shadow-lg shadow-emerald-200/50 hover:bg-emerald-600 transition-all active:scale-95 shrink-0"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </header>

        {/* LAYER 2: CATEGORY NAVIGATION */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-black/[0.03] w-full shadow-sm">
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
                  title: "Delete?",
                  description: "Permanent removal.",
                  action: () => Axios(masterMenuApi.deleteCategory(id)),
                })
              }
            />
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE CONTENT REGION ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* SECTION NAVIGATION (Scrolls with the grid) */}
        {activeCategory && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 px-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Layout size={10} className="text-emerald-500" />
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
              onDelete={(id) =>
                confirmAndDelete({
                  title: "Remove Section?",
                  description: "Deletes group.",
                  action: () => Axios(masterMenuApi.deleteSubcategory(id)),
                })
              }
            />
          </div>
        )}

        {/* ITEMS REGISTRY (Scrolls with the grid) */}
        <div className="animate-in fade-in slide-in-from-bottom-1 duration-500 pb-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-extrabold text-black tracking-tight flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald-500 rounded-full" />
              {activeSubcategoryId === null
                ? "General List"
                : activeSubcategory?.name}
              <span className="text-[9px] font-bold text-slate-300 ml-1">
                {visibleItems.length} items
              </span>
            </h3>
          </div>

          <div className="rounded-[20px] overflow-hidden">
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
              onDeleteItem={(id) =>
                confirmAndDelete({
                  title: "Delete Item?",
                  description: "Permanent removal.",
                  action: () => Axios(masterMenuApi.deleteItem(id)),
                })
              }
              refresh={loadMenu}
            />
          </div>
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
        loading={deleteLoading}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
