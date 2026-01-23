const settingsApi = {
  /* =====================================================
     ADMIN SETTINGS
  ===================================================== */

  updateRestaurantSettings: {
    url: "/api/brand/settings",
    method: "PUT",
  },

  updateAdminProfile: {
    url: "/api/user/profile",
    method: "PUT",
  },

  changeAdminPassword: {
    url: "/api/user/change-password",
    method: "POST",
  },

  /* =====================================================
     MANAGER SETTINGS
  ===================================================== */

  updateManagerSettings: {
    url: "/api/manager/settings",
    method: "PUT",
  },

  updateManagerProfile: {
    url: "/api/user/profile",
    method: "PUT",
  },

  changeManagerPassword: {
    url: "/api/user/change-password",
    method: "POST",
  },

  /* =====================================================
     COMMON USER SETTINGS
  ===================================================== */

  getUserProfile: {
    url: "/api/user/profile",
    method: "GET",
  },
};

export default settingsApi;
