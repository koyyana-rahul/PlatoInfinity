import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { dashboardSummaryController } from "../controller/dashboard.controller.js";

const dashboardRouter     = express.Router();

dashboardRouter.get(
  "/summary",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  dashboardSummaryController
);

export default dashboardRouter;
