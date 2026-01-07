const staffApi = {
  /* ================= STAFF CRUD ================= */

  list: (restaurantId, search = "") => ({
    url: `/api/staff/restaurants/${restaurantId}/staff`,
    method: "GET",
    params: search ? { q: search } : {},
  }),

  create: (restaurantId) => ({
    url: `/api/staff/restaurants/${restaurantId}/staff`,
    method: "POST",
  }),

  regeneratePin: (restaurantId, staffId) => ({
    url: `/api/staff/restaurants/${restaurantId}/staff/${staffId}/regenerate-pin`,
    method: "POST",
  }),

  toggleActive: (restaurantId, staffId) => ({
    url: `/api/staff/restaurants/${restaurantId}/staff/${staffId}/toggle-active`,
    method: "PATCH",
  }),

  /* ================= STAFF AUTH ================= */

  staffLogin: {
    url: "/api/staff/auth/staff-login",
    method: "POST",
  },

  /* ================= ATTENDANCE ================= */

  startShift: {
    url: "/api/staff/shift/start",
    method: "POST",
  },

  endShift: {
    url: "/api/staff/shift/end",
    method: "POST",
  },
};

export default staffApi;
