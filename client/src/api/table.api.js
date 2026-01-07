// src/api/table.api.js
const tableApi = {
  list: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/tables`,
    method: "GET",
  }),

  create: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/tables`,
    method: "POST",
  }),
};

export default tableApi;
