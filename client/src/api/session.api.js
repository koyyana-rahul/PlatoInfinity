const sessionApi = {
  /* ========== STAFF: OPEN/MANAGE SESSIONS ========== */
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

  /* ========== CUSTOMER: PIN VERIFICATION & JOIN ========== */
  joinWithPin: {
    url: "/api/sessions/join",
    method: "POST",
    // body: { tableId, tablePin }
  },

  resumeSession: {
    url: "/api/sessions/resume",
    method: "POST",
    // body: { tableId, tablePin, restaurantId }
  },

  checkTokenExpiry: {
    url: "/api/sessions/check-token",
    method: "POST",
    // body: { sessionId }
  },

  getSessionStatus: (sessionId) => ({
    url: `/api/sessions/${sessionId}/status`,
    method: "GET",
  }),
};

export default sessionApi;
