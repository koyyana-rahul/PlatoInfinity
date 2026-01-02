import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  dailySalesReport,
  waiterWiseSalesReport,
} from "../controller/report.controller.js";

const waiterReportRouter = express.Router();

// DAILY SALES
waiterReportRouter.get(
  "/daily-sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  dailySalesReport
);

// WAITER WISE SALES
waiterReportRouter.get(
  "/waiter-sales",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  waiterWiseSalesReport
);

export default waiterReportRouter;
