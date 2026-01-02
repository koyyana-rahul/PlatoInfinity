// src/routes/invite.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  inviteManagerController,
  assignExistingManagerController,
} from "../controller/invite.controller.js";

const inviteRouter = express.Router();

// Admin-only invite routes
inviteRouter.post(
  "/restaurants/:restaurantId/invite-manager",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  inviteManagerController
);
inviteRouter.post(
  "/restaurants/:restaurantId/assign-existing-manager",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  assignExistingManagerController
);

export default inviteRouter;
