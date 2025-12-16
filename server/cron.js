import cron from "node-cron";
import mongoose from "mongoose";
import { closeInactiveSessions } from "./jobs/sessionTimeout.job.js";

/**
 * Initialize cron jobs
 * This file should be imported ONCE when server starts
 */
export function initCronJobs() {
  // Every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      console.log("[CRON] Running closeInactiveSessions");
      await closeInactiveSessions();
    } catch (err) {
      console.error("[CRON] Error closing inactive sessions", err);
    }
  });

  console.log("✅ Cron jobs initialized");
}
