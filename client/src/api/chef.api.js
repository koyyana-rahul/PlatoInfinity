// src/api/chef.api.js
const chefApi = {
  listOrders: {
    url: "/api/kitchen/orders",
    method: "get",
  },

  updateItemStatus: (orderId, itemId) => ({
    url: `/api/kitchen/order/${orderId}/item/${itemId}/status`,
    method: "put",
  }),
};

export default chefApi;
