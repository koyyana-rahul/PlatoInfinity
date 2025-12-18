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

reportRouter.use(requireAuth, requireRole("MANAGER"));

reportRouter.get("/reports/sales", salesSummaryController);
reportRouter.get("/reports/items", itemSalesReportController);
reportRouter.get("/reports/waiters", waiterReportController);

reportRouter.get(
  "reports/daily-sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  dailySalesReport
);

reportRouter.get(
  "/hourly-sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  hourlySalesReportController
);

reportRouter.get(
  "/reports/gst",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  gstReportController
);

reportRouter.get(
  "/reports/top-items",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  topItemsReportController
);

reportRouter.get(
  "/tax-breakup",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  taxBreakupReportController
);

reportRouter.get(
  "/monthly-pl",
  requireAuth,
  requireRole("OWNER"),
  monthlyPLReportController
);
export default reportRouter;
