// src/api/restaurant.api.js
/**
 * Restaurant API Configuration
 */
const restaurantApi = {
  // List all restaurants
  list: {
    url: "/api/restaurants",
    method: "GET",
  },

  // Create new restaurant
  create: {
    url: "/api/restaurants",
    method: "POST",
  },

  // Get restaurant by ID
  getById: (id) => ({
    url: `/api/restaurants/${id}`,
    method: "GET",
  }),

  // Update restaurant
  update: (id) => ({
    url: `/api/restaurants/${id}`,
    method: "PUT",
  }),

  // Delete restaurant
  delete: (id) => ({
    url: `/api/restaurants/${id}`,
    method: "DELETE",
  }),

  // Get restaurant managers
  managers: (id) => ({
    url: `/api/restaurants/${id}/managers`,
    method: "GET",
  }),

  // Get restaurant statistics
  stats: (id) => ({
    url: `/api/restaurants/${id}/stats`,
    method: "GET",
  }),
};

export default restaurantApi;
