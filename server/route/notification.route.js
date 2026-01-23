import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  sendAlertController,
  getNotificationsController,
  dismissNotificationController,
  markNotificationAsReadController,
} from "../controller/notification.controller.js";

const notificationRouter = express.Router();

// All routes require authentication
notificationRouter.use(requireAuth);

/**
 * Send Alert - Broadcast to all staff
 * POST /api/notifications/send-alert
 */
notificationRouter.post("/send-alert", sendAlertController);

/**
 * Get Notifications
 * GET /api/notifications/list
 */
notificationRouter.get("/list", getNotificationsController);

/**
 * Dismiss Notification
 * PATCH /api/notifications/:notificationId/dismiss
 */
notificationRouter.patch(
  "/:notificationId/dismiss",
  dismissNotificationController,
);

/**
 * Mark Notification as Read
 * PATCH /api/notifications/:notificationId/read
 */
notificationRouter.patch(
  "/:notificationId/read",
  markNotificationAsReadController,
);

export default notificationRouter;
