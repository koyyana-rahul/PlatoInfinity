// src/api/staff.api.js

const staffApi = {
  /* =====================================================
     MANAGER → STAFF MANAGEMENT
  ===================================================== */

  create: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/staff`,
    method: "POST",
  }),

  list: (restaurantId, search = "") => ({
    url: `/api/restaurants/${restaurantId}/staff`,
    method: "GET",
    params: search ? { q: search } : {},
  }),

  regeneratePin: (restaurantId, staffId) => ({
    url: `/api/restaurants/${restaurantId}/staff/${staffId}/regenerate-pin`,
    method: "POST",
  }),

  toggleActive: (restaurantId, staffId) => ({
    url: `/api/restaurants/${restaurantId}/staff/${staffId}/toggle-active`,
    method: "PATCH",
  }),

  /* =====================================================
     STAFF AUTH (PIN LOGIN)
  ===================================================== */

  staffLogin: {
    url: "/api/auth/staff-login",
    method: "POST",
  },

  /* =====================================================
     STAFF SHIFT / ATTENDANCE
  ===================================================== */

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
