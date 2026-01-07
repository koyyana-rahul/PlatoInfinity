// src/api/branchMenu.api.js

const branchMenuApi = {
  /* ===============================
   1️⃣ IMPORT MASTER MENU → BRANCH
   POST /api/branch-menu/:restaurantId/import
   =============================== */
  importFromMaster: (restaurantId) => ({
    url: `/api/branch-menu/${restaurantId}/import`,
    method: "POST",
  }),

  /* ===============================
   2️⃣ LIST BRANCH MENU (FLAT)
   GET /api/branch-menu/:restaurantId
   =============================== */
  list: (restaurantId) => ({
    url: `/api/branch-menu/${restaurantId}`,
    method: "GET",
  }),

  /* ===============================
   3️⃣ LIST BRANCH MENU (GROUPED)
   GET /api/branch-menu/:restaurantId/grouped
   =============================== */
  listGrouped: (restaurantId, params = {}) => ({
    url: `/api/branch-menu/${restaurantId}/grouped`,
    method: "GET",
    params, // { isVeg: true/false }
  }),

  /* ===============================
   4️⃣ UPDATE SINGLE ITEM
   PATCH /api/branch-menu/:restaurantId/item/:itemId
   =============================== */
  updateItem: (restaurantId, itemId) => ({
    url: `/api/branch-menu/${restaurantId}/item/${itemId}`,
    method: "PATCH",
  }),

  /* ===============================
   5️⃣ UPDATE STOCK
   PATCH /api/branch-menu/:restaurantId/item/:itemId/stock
   =============================== */
  updateStock: (restaurantId, itemId) => ({
    url: `/api/branch-menu/${restaurantId}/item/${itemId}/stock`,
    method: "PATCH",
  }),

  /* ===============================
   6️⃣ BULK TOGGLE (ON / OFF)
   POST /api/branch-menu/:restaurantId/bulk-toggle
   =============================== */
  bulkToggle: (restaurantId) => ({
    url: `/api/branch-menu/${restaurantId}/bulk-toggle`,
    method: "POST",
  }),

  /* ===============================
   7️⃣ SYNC WITH MASTER MENU
   POST /api/branch-menu/:restaurantId/sync-with-master
   =============================== */
  syncWithMaster: (restaurantId) => ({
    url: `/api/branch-menu/${restaurantId}/sync-with-master`,
    method: "POST",
  }),
};

export default branchMenuApi;
