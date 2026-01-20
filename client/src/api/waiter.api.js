const waiterApi = {
  serveItem: (orderId, itemId) => ({
    url: `/api/waiter/order/${orderId}/item/${itemId}/serve`,
    method: "POST",
  }),
};

export default waiterApi;
