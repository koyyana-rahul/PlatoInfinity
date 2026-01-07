import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createTableController,
  deleteTableController,
  listTablesController,
} from "../controller/table.controller.js";

const tableRouter = express.Router();

// Manager creates tables
tableRouter.post(
  "/restaurants/:restaurantId/tables",
  requireAuth,
  requireRole("MANAGER"),
  createTableController
);

// Manager lists tables
tableRouter.get(
  "/restaurants/:restaurantId/tables",
  requireAuth,
  requireRole("MANAGER"),
  listTablesController
);

// Delete table (soft delete)
tableRouter.delete(
  "/restaurants/:restaurantId/tables/:tableId",
  requireAuth,
  requireRole("MANAGER"),
  deleteTableController
);
export default tableRouter;
