// src/api/restaurant.api.js
const restaurantApi = {
  list: { url: "/api/restaurants", method: "GET" },
  create: { url: "/api/restaurants", method: "POST" },

  getById: (id) => ({
    url: `/api/restaurants/${id}`,
    method: "GET",
  }),

  managers: (id) => ({
    url: `/api/restaurants/${id}/managers`,
    method: "GET",
  }),

  inviteManager: (id) => ({
    url: `/api/restaurants/${id}/managers/invite`,
    method: "POST",
  }),
};

export default restaurantApi;
