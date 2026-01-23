const reportsApi = {
  /* =====================================================
     SALES REPORTS
  ===================================================== */

  getSalesReport: (from, to) => ({
    url: "/api/reports/sales",
    method: "GET",
    params: { from, to },
  }),

  getDailySalesReport: (from, to) => ({
    url: "/api/reports/daily-sales",
    method: "GET",
    params: { from, to },
  }),

  getHourlySalesReport: (from, to) => ({
    url: "/api/reports/hourly-sales",
    method: "GET",
    params: { from, to },
  }),

  /* =====================================================
     ITEM & PRODUCT REPORTS
  ===================================================== */

  getItemSalesReport: (from, to) => ({
    url: "/api/reports/items",
    method: "GET",
    params: { from, to },
  }),

  getTopItemsReport: (limit = 10, from, to) => ({
    url: "/api/reports/top-items",
    method: "GET",
    params: { limit, from, to },
  }),

  /* =====================================================
     STAFF & WAITER REPORTS
  ===================================================== */

  getWaiterReport: (from, to) => ({
    url: "/api/reports/waiters",
    method: "GET",
    params: { from, to },
  }),

  /* =====================================================
     TAX & COMPLIANCE REPORTS
  ===================================================== */

  getGSTReport: (from, to) => ({
    url: "/api/reports/gst",
    method: "GET",
    params: { from, to },
  }),

  getTaxBreakupReport: (from, to) => ({
    url: "/api/reports/tax-breakup",
    method: "GET",
    params: { from, to },
  }),

  /* =====================================================
     FINANCIAL REPORTS
  ===================================================== */

  getMonthlyPLReport: (month, year) => ({
    url: "/api/reports/monthly-pl",
    method: "GET",
    params: { month, year },
  }),
};

export default reportsApi;
