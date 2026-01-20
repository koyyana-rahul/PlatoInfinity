const sessionApi = {
  list: (restaurantId, params = {}) => ({
    url: `/api/restaurants/${restaurantId}/sessions`,
    method: "GET",
    params,
  }),

  open: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/sessions/open`,
    method: "POST",
  }),

  get: (restaurantId, sessionId) => ({
    url: `/api/restaurants/${restaurantId}/sessions/${sessionId}`,
    method: "GET",
  }),

  close: (restaurantId, sessionId) => ({
    url: `/api/restaurants/${restaurantId}/sessions/${sessionId}/close`,
    method: "POST",
  }),

  shift: (restaurantId, sessionId) => ({
    url: `/api/restaurants/${restaurantId}/sessions/${sessionId}/shift`,
    method: "POST",
  }),
};

export default sessionApi;
