const customerApi = {
  publicTable: (tableId) => ({
    url: `/api/public/table/${tableId}`,
    method: "GET",
  }),

  publicMenuByTable: (tableId, params = {}) => ({
    url: `/api/public/table/${tableId}/menu`,
    method: "GET",
    params,
  }),

  /* ✅ ITEM INNER PAGE */
  publicMenuItem: (itemId) => ({
    url: `/api/public/menu-item/${itemId}`,
    method: "GET",
  }),

  joinSession: {
    url: "/api/sessions/join",
    method: "POST",
  },

  cart: {
    get: { url: "/api/cart", method: "GET" },
    add: { url: "/api/cart/add", method: "POST" },
    update: { url: "/api/cart/update", method: "PUT" },
    remove: (id) => ({
      url: `/api/cart/item/${id}`,
      method: "DELETE",
    }),
  },

  order: {
    place: { url: "/api/order/place", method: "POST" },
    listBySession: (sessionId) => ({
      url: `/api/order/session/${sessionId}`,
      method: "GET",
    }),
  },

  bill: {
    get: { url: "/api/customer/bill", method: "GET" },
  },
};

export default customerApi;
