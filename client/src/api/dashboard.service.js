import Axios from "./axios";

/**
 * Dashboard Service - Backend Integration Layer
 * Handles all API calls for admin dashboard
 * Uses Axios with proper error handling
 */

const dashboardService = {
  /* =====================================================
     KPI METRICS - Revenue, Orders, Completion Rate
  ===================================================== */

  getKPIMetrics: async (timeRange = "today", restaurantId = null) => {
    try {
      const params = { range: timeRange };
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/kpi", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching KPI metrics:", error);
      throw error;
    }
  },

  /* =====================================================
     PERFORMANCE METRICS - Top Staff Performers
  ===================================================== */

  getPerformanceMetrics: async (restaurantId = null) => {
    try {
      const params = {};
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/performance", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      throw error;
    }
  },

  /* =====================================================
     OPERATIONAL METRICS - Prep Time, Delivery, Satisfaction
  ===================================================== */

  getOperationalMetrics: async (timeRange = "today", restaurantId = null) => {
    try {
      const params = { range: timeRange };
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/operational", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching operational metrics:", error);
      throw error;
    }
  },

  /* =====================================================
     REVENUE BREAKDOWN - By Category, Payment Method
  ===================================================== */

  getRevenueBreakdown: async (timeRange = "today", restaurantId = null) => {
    try {
      const params = { range: timeRange };
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/revenue-breakdown", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue breakdown:", error);
      throw error;
    }
  },

  /* =====================================================
     RECENT ORDERS - Live Order Tracking
  ===================================================== */

  getRecentOrders: async (
    limit = 10,
    timeRange = "today",
    restaurantId = null,
  ) => {
    try {
      const params = { limit, range: timeRange };
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/order/recent", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      throw error;
    }
  },

  /* =====================================================
     DASHBOARD SUMMARY - Quick Stats
  ===================================================== */

  getDashboardSummary: async (restaurantId = null) => {
    try {
      const params = {};
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/summary", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      throw error;
    }
  },

  /* =====================================================
     REVENUE CHART - Graphical Data
  ===================================================== */

  getRevenueChart: async (timeRange = "today", restaurantId = null) => {
    try {
      const params = { range: timeRange };
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/revenue-chart", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue chart:", error);
      throw error;
    }
  },

  /* =====================================================
     ORDER STATS - Order Distribution
  ===================================================== */

  getOrderStats: async (timeRange = "today", restaurantId = null) => {
    try {
      const params = { range: timeRange };
      if (restaurantId) params.restaurantId = restaurantId;

      const response = await Axios.get("/api/dashboard/order-stats", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching order stats:", error);
      throw error;
    }
  },

  /* =====================================================
     BRANCHES/RESTAURANTS - Multi-Location Support
  ===================================================== */

  getBranches: async () => {
    try {
      const response = await Axios.get("/api/restaurants");
      return response.data;
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  /* =====================================================
     MANAGER DASHBOARD STATS
  ===================================================== */

  getManagerStats: async (restaurantId, timeRange = "today") => {
    try {
      const params = { range: timeRange };
      const response = await Axios.get(
        `/api/restaurants/${restaurantId}/dashboard/stats`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching manager stats:", error);
      throw error;
    }
  },

  /* =====================================================
     MANAGER ORDERS
  ===================================================== */

  getManagerOrders: async (restaurantId, limit = 10, timeRange = "today") => {
    try {
      const params = { limit, range: timeRange };
      const response = await Axios.get(
        `/api/restaurants/${restaurantId}/orders`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching manager orders:", error);
      throw error;
    }
  },
};

export default dashboardService;
