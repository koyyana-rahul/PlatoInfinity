// import { useEffect, useMemo, useState } from "react";
// import { Plus, UtensilsCrossed, Leaf, Flame, Filter } from "lucide-react";
// import toast from "react-hot-toast";

// import Axios from "../../../api/axios";
// import masterMenuApi from "../../../api/masterMenu.api";

// import CategoryBar from "./CategoryBar";
// import SubcategoryBar from "./SubcategoryBar";
// import ItemGrid from "./ItemGrid";

// import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

// import CreateCategoryModal from "./modals/CreateCategoryModal";
// import EditCategoryModal from "./modals/EditCategoryModal";
// import CreateItemModal from "./modals/CreateItemModal";
// import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
// import CreateSubcategoryModal from "./modals/CreateSubcategoryModal";
// import EditSubcategoryModal from "./modals/EditSubcategoryModal";
// /* ================= HELPERS ================= */
// const getAllCategoryItems = (category) => {
//   if (!category) return [];
//   return [
//     ...(category.items || []),
//     ...(category.subcategories?.flatMap((s) => s.items || []) || []),
//   ];
// };

// export default function MasterMenuPage() {
//   const [menu, setMenu] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [activeCategoryId, setActiveCategoryId] = useState(null);
//   const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);

//   const [vegFilter, setVegFilter] = useState("all");
//   const [modal, setModal] = useState({ type: null, data: null });

//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   /* ================= API ================= */
//   const loadMenu = async () => {
//     try {
//       setLoading(true);
//       const res = await Axios(masterMenuApi.tree);
//       const data = res.data?.data || [];
//       setMenu(data);

//       if (!activeCategoryId && data.length) {
//         setActiveCategoryId(data[0].id);
//         setActiveSubcategoryId(null);
//       }
//     } catch {
//       toast.error("Failed to load menu");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMenu();
//   }, []);

//   /* ================= DERIVED ================= */
//   const activeCategory = useMemo(
//     () => menu.find((c) => c.id === activeCategoryId),
//     [menu, activeCategoryId]
//   );

//   const subcategories = activeCategory?.subcategories || [];
//   const activeSubcategory =
//     subcategories.find((s) => s.id === activeSubcategoryId) || null;

//   const visibleItems = useMemo(() => {
//     if (!activeCategory) return [];
//     const items =
//       activeSubcategoryId === null
//         ? getAllCategoryItems(activeCategory)
//         : activeSubcategory?.items || [];

//     if (vegFilter === "veg") return items.filter((i) => i.isVeg);
//     if (vegFilter === "nonveg") return items.filter((i) => !i.isVeg);
//     return items;
//   }, [activeCategory, activeSubcategoryId, vegFilter]);

//   const closeModal = () => setModal({ type: null, data: null });

//   /* ================= DELETE ================= */
//   const confirmAndDelete = ({ title, description, action }) => {
//     setConfirmDelete({ title, description, action });
//   };

//   const executeDelete = async () => {
//     if (!confirmDelete) return;
//     setDeleteLoading(true);
//     try {
//       await confirmDelete.action();
//       toast.success("Deleted successfully");
//       setConfirmDelete(null);
//       loadMenu();
//     } catch {
//       toast.error("Delete failed");
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="min-h-screen bg-[#f2f2f2] flex flex-col">
//       {/* ================= HEADER (STICKY) ================= */}

//       <header className="sticky top-0 z-40 bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
//           <h1 className="text-sm font-semibold text-gray-900">Master Menu</h1>

//           <div className="flex items-center gap-3">
//             <div className="flex bg-gray-100 rounded-full p-1">
//               {[
//                 { id: "all", label: "All" },
//                 { id: "veg", label: "Veg", isVeg: true },
//                 { id: "nonveg", label: "Non-Veg", isVeg: false },
//               ].map((v) => (
//                 <button
//                   key={v.id}
//                   onClick={() => setVegFilter(v.id)}
//                   className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-2 ${
//                     vegFilter === v.id ? "bg-black text-white" : "text-gray-600"
//                   }`}
//                 >
//                   {v.isVeg !== undefined && (
//                     <VegNonVegIcon isVeg={v.isVeg} size={8} />
//                   )}
//                   {v.label}
//                 </button>
//               ))}
//             </div>

//             <button
//               onClick={() => setModal({ type: "category" })}
//               className="bg-black text-white px-4 py-2 rounded-md text-xs flex items-center gap-1"
//             >
//               <Plus size={12} />
//               Category
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ================= CATEGORY BAR (STICKY) ================= */}
//       <div className="sticky z-40 bg-white border-b">
//         <div className="px-2 py-1">
//           <CategoryBar
//             categories={menu}
//             activeCategoryId={activeCategoryId}
//             onSelect={(id) => {
//               setActiveCategoryId(id);
//               setActiveSubcategoryId(null);
//             }}
//             onEdit={(cat) => setModal({ type: "editCategory", data: cat })}
//             onDelete={(id) =>
//               confirmAndDelete({
//                 title: "Delete Category",
//                 description:
//                   "This will permanently delete the category and all its items.",
//                 action: () => Axios(masterMenuApi.deleteCategory(id)),
//               })
//             }
//           />
//         </div>
//       </div>

//       {/* ================= SUBCATEGORY BAR (STICKY) ================= */}
//       <div className="sticky top-[108px] z-30 bg-[#eeeeee] border-b">
//         <div className="max-w-7xl mx-auto px-4 py-2">
//           <SubcategoryBar
//             subcategories={subcategories}
//             activeSubcategoryId={activeSubcategoryId}
//             onSelect={setActiveSubcategoryId}
//             onAdd={() =>
//               setModal({ type: "subcategory", data: activeCategory.id })
//             }
//             onEdit={(sub) => setModal({ type: "editSubcategory", data: sub })}
//             onDelete={(id) =>
//               confirmAndDelete({
//                 title: "Delete Section",
//                 description: "All items inside this section will be deleted.",
//                 action: () => Axios(masterMenuApi.deleteSubcategory(id)),
//               })
//             }
//           />
//         </div>
//       </div>

// {/* ================= ITEM GRID ================= */}
// <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-3 pb-24">
//   <ItemGrid
//     title={activeSubcategoryId === null ? "All" : activeSubcategory?.name}
//     items={visibleItems}
//     isAllSection={activeSubcategoryId === null}
//     onAddItem={() =>
//       setModal({
//         type: "item",
//         data: {
//           categoryId: activeCategory.id,
//           subcategoryId: activeSubcategoryId,
//         },
//       })
//     }
//     onDeleteItem={(id) =>
//       confirmAndDelete({
//         title: "Delete Item",
//         description: "This item will be permanently removed from menu.",
//         action: () => Axios(masterMenuApi.deleteItem(id)),
//       })
//     }
//     refresh={loadMenu}
//   />
// </main>

//       {/* ================= MODALS ================= */}
//       {modal.type === "category" && (
//         <CreateCategoryModal onClose={closeModal} onSuccess={loadMenu} />
//       )}
//       {modal.type === "editCategory" && (
//         <EditCategoryModal
//           category={modal.data}
//           onClose={closeModal}
//           onSuccess={loadMenu}
//         />
//       )}
//       {modal.type === "subcategory" && (
//         <CreateSubcategoryModal
//           categoryId={modal.data}
//           onClose={closeModal}
//           onSuccess={loadMenu}
//         />
//       )}
//       {modal.type === "editSubcategory" && (
//         <EditSubcategoryModal
//           subcategory={modal.data}
//           onClose={closeModal}
//           onSuccess={loadMenu}
//         />
//       )}
//       {modal.type === "item" && (
//         <CreateItemModal
//           categoryId={modal.data.categoryId}
//           subcategoryId={modal.data.subcategoryId}
//           onClose={closeModal}
//           onSuccess={loadMenu}
//         />
//       )}

//       <ConfirmDeleteModal
//         open={!!confirmDelete}
//         title={confirmDelete?.title}
//         description={confirmDelete?.description}
//         loading={deleteLoading}
//         onCancel={() => setConfirmDelete(null)}
//         onConfirm={executeDelete}
//       />
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

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

  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= LOAD MENU ================= */
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

  /* ================= DELETE ================= */
  const confirmAndDelete = ({ title, description, action }) => {
    setConfirmDelete({ title, description, action });
  };

  const executeDelete = async () => {
    try {
      setDeleteLoading(true);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* TITLE */}
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">
              Master Menu
            </h1>
            <p className="text-xs text-gray-500">
              Categories → Sections → Items
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* FILTER */}
            <div className="flex bg-gray-100 rounded-full p-1 shrink-0">
              {[
                { id: "all", label: "All" },
                { id: "veg", label: "Veg", isVeg: true },
                { id: "nonveg", label: "Non-Veg", isVeg: false },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVegFilter(v.id)}
                  className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-2 whitespace-nowrap ${
                    vegFilter === v.id ? "bg-black text-white" : "text-gray-600"
                  }`}
                >
                  {v.isVeg !== undefined && (
                    <VegNonVegIcon isVeg={v.isVeg} size={8} />
                  )}
                  {v.label}
                </button>
              ))}
            </div>

            {/* ADD CATEGORY */}
            <button
              onClick={() => setModal({ type: "category" })}
              className="bg-black text-white px-4 py-2 rounded-md text-xs flex items-center gap-1 shrink-0"
            >
              <Plus size={12} />
              Category
            </button>
          </div>
        </div>
      </header>

      {/* ================= CATEGORY BAR ================= */}
      <div className="sticky top-[88px] z-30 bg-white border-b">
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
                "This will permanently delete the category and all items.",
              action: () => Axios(masterMenuApi.deleteCategory(id)),
            })
          }
        />
      </div>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 space-y-5">
        {/* SUBCATEGORIES */}
        {activeCategory && (
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
        )}

        {/* ITEMS */}
        {/* ================= ITEM GRID ================= */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-3 pb-24">
          <ItemGrid
            title={
              activeSubcategoryId === null ? "All" : activeSubcategory?.name
            }
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
      </main>

      {/* ================= MODALS ================= */}
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
