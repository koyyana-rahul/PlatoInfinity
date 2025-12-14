// src/routes/kitchenStation.route.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createKitchenStation,
  listKitchenStations,
  disableKitchenStation,
  enableKitchenStation,
} from "../controller/kitchenStation.controller.js";

const kitchenStationRouter = express.Router();

/**
 * MANAGER ONLY
 */

// Create station
kitchenStationRouter.post(
  "/restaurants/:restaurantId/kitchen-stations",
  requireAuth,
  requireRole("MANAGER"),
  createKitchenStation
);

// List stations
kitchenStationRouter.get(
  "/restaurants/:restaurantId/kitchen-stations",
  requireAuth,
  requireRole("MANAGER"),
  listKitchenStations
);

// Disable station
kitchenStationRouter.delete(
  "/kitchen-stations/:stationId",
  requireAuth,
  requireRole("MANAGER"),
  disableKitchenStation
);

kitchenStationRouter.patch(
  "/kitchen-stations/:stationId/enable",
  requireAuth,
  requireRole("MANAGER"),
  enableKitchenStation
);

export default kitchenStationRouter;
