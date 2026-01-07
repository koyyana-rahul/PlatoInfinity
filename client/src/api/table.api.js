const tableApi = {
  list: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/tables`,
    method: "GET",
  }),

  create: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/tables`,
    method: "POST",
  }),

  delete: (restaurantId, tableId) => ({
    url: `/api/restaurants/${restaurantId}/tables/${tableId}`,
    method: "DELETE",
  }),
};

export default tableApi;
