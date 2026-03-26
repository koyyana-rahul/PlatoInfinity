import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Download } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import clsx from "clsx";

import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import branchMenuApi from "../../../../api/branchMenu.api";

import BranchCategoryBar from "../components/BranchCategoryBar";
import BranchSubcategoryBar from "../components/BranchSubcategoryBar";
import BranchItemGrid from "../components/BranchItemGrid";
import VegNonVegIcon from "../../../../components/ui/VegNonVegIcon";

import ImportFromMasterModal from "../modals/ImportFromMasterModal";
import SyncWithMasterModal from "../modals/SynchWithMasterModal";
import EditBranchItemModal from "../modals/EditBranchItemModal";
import UpdateStockModal from "../modals/UpdateStockModal";

import { mapBranchMenuTree } from "../helpers/mapBranchMenuTree";

export default function BranchMenuPage() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [masterMenu, setMasterMenu] = useState([]);
  const [branchGrouped, setBranchGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);
  const [vegFilter, setVegFilter] = useState("all");

  const [modal, setModal] = useState(null);

  /* ================= LOAD DATA ================= */

  const loadAll = async () => {
    try {
      setLoading(true);

      const [masterRes, branchRes] = await Promise.all([
        Axios(masterMenuApi.tree),
        Axios(branchMenuApi.listGrouped(restaurantId)),
      ]);

      const master = masterRes.data?.data || [];
      const grouped = branchRes.data?.data || {};

      setMasterMenu(master);
      setBranchGrouped(grouped);

      if (!activeCategoryId && master.length) {
        setActiveCategoryId(master[0].id);
        setActiveSubcategoryId(null);
      }
    } catch {
      toast.error("Failed to load branch menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================= DERIVED ================= */

  const mappedMenu = useMemo(
    () => mapBranchMenuTree(masterMenu, branchGrouped),
    [masterMenu, branchGrouped],
  );

  const visibleMenu = useMemo(
    () =>
      mappedMenu
        .map((category) => {
          const filteredSubcategories = (category.subcategories || []).filter(
            (sub) => (sub.items || []).length > 0,
          );

          return {
            ...category,
            subcategories: filteredSubcategories,
            items: (category.items || []).filter(Boolean),
          };
        })
        .filter((category) => {
          const hasCategoryItems = (category.items || []).length > 0;
          const hasSubcategoryItems = (category.subcategories || []).length > 0;
          return hasCategoryItems || hasSubcategoryItems;
        }),
    [mappedMenu],
  );

  useEffect(() => {
    if (!activeCategoryId && visibleMenu.length) {
      setActiveCategoryId(visibleMenu[0].id);
      setActiveSubcategoryId(null);
    }
  }, [activeCategoryId, visibleMenu]);

  const activeCategory = visibleMenu.find((c) => c.id === activeCategoryId);

  const activeSubcategory =
    activeCategory?.subcategories.find((s) => s.id === activeSubcategoryId) ||
    null;

  const visibleItems = useMemo(() => {
    const items =
      activeSubcategoryId === null
        ? [
            ...(activeCategory?.items || []),
            ...(activeCategory?.subcategories.flatMap((s) => s.items) || []),
          ]
        : activeSubcategory?.items || [];

    if (vegFilter === "veg") return items.filter((i) => i.isVeg);
    if (vegFilter === "nonveg") return items.filter((i) => !i.isVeg);
    return items;
  }, [activeCategory, activeSubcategoryId, activeSubcategory, vegFilter]);

  const totalItems = visibleMenu.reduce((sum, cat) => {
    const categoryItems = cat.items?.length || 0;
    const subcategoryItems = (cat.subcategories || []).reduce(
      (acc, sub) => acc + (sub.items?.length || 0),
      0,
    );
    return sum + categoryItems + subcategoryItems;
  }, 0);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-300">
      {/* ================= STICKY HEADER ================= */}
      <div className="sticky top-0 z-30 bg-white shadow-sm transition-shadow duration-300">
        {/* Top Header */}
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2.5 sm:py-4">
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {/* Title & Actions Row */}
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                    Menu Management
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Customize prices, availability & stock
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-gray-50">
                    <Download size={12} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">
                      {totalItems}
                    </span>
                  </div>

                  <button
                    onClick={() => setModal({ type: "sync" })}
                    className="p-1.5 sm:px-3 sm:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
                    title="Sync with Master"
                  >
                    <RefreshCcw size={14} />
                  </button>

                  <button
                    onClick={() => setModal({ type: "import" })}
                    className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all active:scale-95 font-semibold whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Import from Master</span>
                    <span className="sm:hidden">Import</span>
                  </button>
                </div>
              </div>

              {/* Veg/Non-Veg Filter Row */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 pb-0.5 sm:pb-1">
                <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1 border border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                  {[
                    { id: "all", label: "All" },
                    { id: "veg", label: "Veg", isVeg: true },
                    { id: "nonveg", label: "Non-Veg", isVeg: false },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVegFilter(v.id)}
                      className={clsx(
                        "px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-md transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap",
                        vegFilter === v.id
                          ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-200",
                      )}
                    >
                      {v.isVeg !== undefined && (
                        <VegNonVegIcon isVeg={v.isVeg} size={7} />
                      )}
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Item Count */}
                <div className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 bg-gray-50">
                  <Download size={10} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {totalItems}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Category Navigation Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
            <BranchCategoryBar
              categories={visibleMenu}
              activeCategoryId={activeCategoryId}
              onSelect={(id) => {
                setActiveCategoryId(id);
                setActiveSubcategoryId(null);
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 py-2.5 sm:py-6 space-y-2.5 sm:space-y-6 transition-all">
        {activeCategory && (
          <BranchSubcategoryBar
            subcategories={activeCategory.subcategories}
            activeSubcategoryId={activeSubcategoryId}
            onSelect={setActiveSubcategoryId}
          />
        )}

        <BranchItemGrid
          title={
            activeSubcategoryId === null ? "All Items" : activeSubcategory?.name
          }
          items={visibleItems}
          loading={loading}
          onEdit={(item) => setModal({ type: "editItem", data: item })}
          onStock={(item) => setModal({ type: "stock", data: item })}
          refresh={loadAll}
        />
      </main>

      {/* ================= MODALS ================= */}
      {modal?.type === "import" && (
        <ImportFromMasterModal
          restaurantId={restaurantId}
          onClose={() => setModal(null)}
          onSuccess={loadAll}
        />
      )}

      {modal?.type === "sync" && (
        <SyncWithMasterModal
          restaurantId={restaurantId}
          onClose={() => setModal(null)}
          onSuccess={loadAll}
        />
      )}

      {modal?.type === "editItem" && (
        <EditBranchItemModal
          restaurantId={restaurantId}
          item={modal.data}
          onClose={() => setModal(null)}
          onSuccess={loadAll}
        />
      )}

      {modal?.type === "stock" && (
        <UpdateStockModal
          restaurantId={restaurantId}
          item={modal.data}
          onClose={() => setModal(null)}
          onSuccess={loadAll}
        />
      )}
    </div>
  );
}
