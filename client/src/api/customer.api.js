import orderApi, { generateIdempotencyKey } from "./order.api.js";

const customerApi = {
  /* ========== MENU ========== */
  publicTable: (tableId) => ({
    url: `/api/public/table/${tableId}`,
    method: "GET",
  }),

  publicMenuByTable: (tableId, params = {}) => ({
    url: `/api/public/table/${tableId}/menu`,
    method: "GET",
    params,
  }),

  publicMenuItem: (itemId) => ({
    url: `/api/public/menu-item/${itemId}`,
    method: "GET",
  }),

  /* ========== SESSION & PIN ========== */
  joinSession: {
    url: "/api/sessions/join",
    method: "POST",
    // body: { tableId, tablePin }
  },

  resumeSession: {
    url: "/api/sessions/resume",
    method: "POST",
    // body: { tableId, tablePin, restaurantId }
  },

  /* ========== CART (REAL-TIME SYNCED) ========== */
  cart: {
    get: {
      url: "/api/cart",
      method: "GET",
    },

    add: {
      url: "/api/cart/add",
      method: "POST",
      // body: {
      //   restaurantId,
      //   sessionId,
      //   branchMenuItemId,
      //   quantity,
      //   selectedModifiers
      // }
    },

    update: {
      url: "/api/cart/update",
      method: "PUT",
      // body: {
      //   itemId,
      //   quantity
      // }
    },

    remove: (id) => ({
      url: `/api/cart/item/${id}`,
      method: "DELETE",
    }),

    clear: {
      url: "/api/cart/clear",
      method: "DELETE",
    },

    getBySession: (sessionId) => ({
      url: `/api/cart/session/${sessionId}`,
      method: "GET",
    }),
  },

  /* ========== ORDER (WITH IDEMPOTENCY) ========== */
  order: {
    place: {
      url: "/api/order/place",
      method: "POST",
      // body: {
      //   sessionId,
      //   restaurantId,
      //   tableId,
      //   paymentMethod,
      //   idempotencyKey: generateIdempotencyKey()
      // }
    },

    listBySession: (sessionId) => ({
      url: `/api/order/session/${sessionId}`,
      method: "GET",
    }),

    getDetails: (orderId) => ({
      url: `/api/order/${orderId}`,
      method: "GET",
    }),

    retry: {
      url: "/api/order/retry",
      method: "POST",
      // body: { sessionId, restaurantId, idempotencyKey }
    },

    checkStatus: (idempotencyKey) => ({
      url: `/api/order/status/${idempotencyKey}`,
      method: "GET",
    }),
  },

  /* ========== BILL & PAYMENT ========== */
  bill: {
    get: {
      url: "/api/customer/bill",
      method: "GET",
    },

    getBySession: (sessionId) => ({
      url: `/api/customer/bill/session/${sessionId}`,
      method: "GET",
    }),

    split: {
      url: "/api/customer/bill/split",
      method: "POST",
      // body: { sessionId, amounts: [100, 200, ...] }
    },
  },

  /* ========== REAL-TIME HELPERS ========== */
  generateIdempotencyKey,
};

export default customerApi;
