import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../../../api/axios";
import masterMenuApi from "../../../../api/masterMenu.api";
import branchMenuApi from "../../../../api/branchMenu.api";

import BranchCategoryBar from "../components/BranchCategoryBar";
import BranchSubcategoryBar from "../components/BranchSubcategoryBar";
import BranchItemGrid from "../components/BranchItemGrid";

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

  const activeCategory = mappedMenu.find((c) => c.id === activeCategoryId);

  const activeSubcategory =
    activeCategory?.subcategories.find((s) => s.id === activeSubcategoryId) ||
    null;

  const visibleItems =
    activeSubcategoryId === null
      ? [
          ...(activeCategory?.items || []),
          ...(activeCategory?.subcategories.flatMap((s) => s.items) || []),
        ]
      : activeSubcategory?.items || [];

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Branch Menu</h1>
            <p className="text-xs text-gray-500">
              Customize prices, availability & stock
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModal({ type: "import" })}
              className="px-3 py-2 text-xs bg-black text-white rounded-md"
            >
              Import from Master
            </button>

            <button
              onClick={() => setModal({ type: "sync" })}
              className="px-3 py-2 text-xs border rounded-md"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= CATEGORY BAR ================= */}
      <BranchCategoryBar
        categories={mappedMenu}
        activeCategoryId={activeCategoryId}
        onSelect={(id) => {
          setActiveCategoryId(id);
          setActiveSubcategoryId(null);
        }}
      />

      {/* ================= CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 space-y-5">
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
