import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  dashboardSummaryController,
  dashboardStatsController,
  kpiMetricsController,
  performanceMetricsController,
  operationalMetricsController,
  revenueBreakdownController,
} from "../controller/dashboard.controller.js";
import { exportDashboardReportController } from "../controller/report.controller.js";

const dashboardRouter = express.Router();

// Debug middleware
dashboardRouter.use((req, res, next) => {
  console.log(
    "📍 Dashboard router middleware hit:",
    req.method,
    req.originalUrl,
  );
  next();
});

// ✅ Admin Dashboard - Stats (no role check needed)
dashboardRouter.get("/stats", requireAuth, dashboardStatsController);

// ✅ Manager Dashboard - Summary (requires MANAGER or BRAND_ADMIN role)
dashboardRouter.get(
  "/summary",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  dashboardSummaryController,
);

// ✅ Professional Dashboard - KPI Metrics
dashboardRouter.get(
  "/kpi",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  kpiMetricsController,
);

// ✅ Professional Dashboard - Performance Metrics
dashboardRouter.get(
  "/performance",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  performanceMetricsController,
);

// ✅ Professional Dashboard - Operational Metrics
dashboardRouter.get(
  "/operational",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  operationalMetricsController,
);

// ✅ Professional Dashboard - Revenue Breakdown
dashboardRouter.get(
  "/revenue-breakdown",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  revenueBreakdownController,
);

// ✅ Export Dashboard Report (CSV/JSON)
dashboardRouter.get(
  "/report/export",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  exportDashboardReportController,
);

export default dashboardRouter;
