import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  salesSummaryController,
  itemSalesReportController,
  waiterReportController,
  gstReportController,
  topItemsReportController,
  dailySalesReport,
  hourlySalesReportController,
  taxBreakupReportController,
  monthlyPLReportController,
} from "../controller/report.controller.js";

const reportRouter = express.Router();

// ✅ Sales Summary Report
reportRouter.get(
  "/sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  salesSummaryController,
);

// ✅ Item Sales Report
reportRouter.get(
  "/items",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  itemSalesReportController,
);

// ✅ Waiter Report
reportRouter.get(
  "/waiters",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  waiterReportController,
);

// ✅ Daily Sales Report
reportRouter.get(
  "/daily-sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  dailySalesReport,
);

// ✅ Hourly Sales Report
reportRouter.get(
  "/hourly-sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  hourlySalesReportController,
);

// ✅ GST Report
reportRouter.get(
  "/gst",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  gstReportController,
);

// ✅ Top Items Report
reportRouter.get(
  "/top-items",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  topItemsReportController,
);

reportRouter.get(
  "/tax-breakup",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  taxBreakupReportController,
);

reportRouter.get(
  "/monthly-pl",
  requireAuth,
  requireRole("OWNER"),
  monthlyPLReportController,
);
export default reportRouter;
