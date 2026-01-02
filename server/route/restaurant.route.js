// src/routes/restaurants.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createRestaurantController,
  getRestaurantByIdController,
  listRestaurantsController,
} from "../controller/restaurant.controller.js";

const restaurantRouter = express.Router();

restaurantRouter.post(
  "/",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  createRestaurantController
);
restaurantRouter.get(
  "/",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  listRestaurantsController
);

// src/routes/restaurants.js
restaurantRouter.get(
  "/:restaurantId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  getRestaurantByIdController
);

export default restaurantRouter;
