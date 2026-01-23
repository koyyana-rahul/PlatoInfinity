const dashboardApi = {
  /* =====================================================
     ADMIN DASHBOARD
  ===================================================== */

  getBranches: () => ({
    url: "/api/restaurants",
    method: "GET",
  }),

  getStats: (range = "today") => ({
    url: "/api/dashboard/stats",
    method: "GET",
    params: { range },
  }),

  getKPIMetrics: (range = "today", restaurantId = null) => ({
    url: "/api/dashboard/kpi",
    method: "GET",
    params: { range, ...(restaurantId && { restaurantId }) },
  }),

  getPerformanceMetrics: (restaurantId = null) => ({
    url: "/api/dashboard/performance",
    method: "GET",
    params: { ...(restaurantId && { restaurantId }) },
  }),

  getOperationalMetrics: (range = "today", restaurantId = null) => ({
    url: "/api/dashboard/operational",
    method: "GET",
    params: { range, ...(restaurantId && { restaurantId }) },
  }),

  getRevenueBreakdown: (range = "today", restaurantId = null) => ({
    url: "/api/dashboard/revenue-breakdown",
    method: "GET",
    params: { range, ...(restaurantId && { restaurantId }) },
  }),

  getRecentOrders: (limit = 10, range = "today", restaurantId = null) => ({
    url: "/api/order/recent",
    method: "GET",
    params: { limit, range, ...(restaurantId && { restaurantId }) },
  }),

  getRevenueChart: (range = "today") => ({
    url: "/api/dashboard/revenue-chart",
    method: "GET",
    params: { range },
  }),

  getOrderStats: (range = "today") => ({
    url: "/api/dashboard/order-stats",
    method: "GET",
    params: { range },
  }),

  /* =====================================================
     MANAGER DASHBOARD
  ===================================================== */

  getManagerStats: (restaurantId, range = "today") => ({
    url: `/api/restaurants/${restaurantId}/dashboard/stats`,
    method: "GET",
    params: { range },
  }),

  getManagerOrders: (restaurantId, limit = 10, range = "today") => ({
    url: `/api/restaurants/${restaurantId}/orders`,
    method: "GET",
    params: { limit, range },
  }),

  /* =====================================================
     COMMON
  ===================================================== */

  summary: {
    url: "/api/dashboard/summary",
    method: "GET",
  },
};

export default dashboardApi;
