const waiterApi = {
  // Get all orders for waiter
  getOrders: {
    url: "/api/waiter/orders",
    method: "GET",
  },

  // Get items ready to serve
  getReadyItems: {
    url: "/api/waiter/ready-items",
    method: "GET",
  },

  // Serve an item
  serveItem: (orderId, itemId) => ({
    url: `/api/waiter/order/${orderId}/item/${itemId}/serve`,
    method: "POST",
  }),
};

export default waiterApi;
