import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/connectDB.js";

// ROUTES
import authRouter from "./route/auth.route.js";
import brandRouter from "./route/brand.route.js";
import restaurantRouter from "./route/restaurant.route.js";
import authInviteRouter from "./route/auth.invite.route.js";
import staffRouter from "./route/staff.route.js";
import menuRouter from "./route/menu.route.js";
import sessionRouter from "./route/session.route.js";
import suspiciousRouter from "./route/suspicious.route.js";
import orderRouter from "./route/order.route.js";
import masterMenuRouter from "./route/masterMenu.route.js";
import managerRouter from "./route/manager.route.js";
import kitchenStationRouter from "./route/kitchenStation.route.js";
import customerMenuRouter from "./route/customerMenu.route.js";
import tableRouter from "./route/table.route.js";
import cartRouter from "./route/cart.route.js";
import billRouter from "./route/bill.route.js";
import reportRouter from "./route/report.route.js";
import whatsappRouter from "./route/billWhatsapp.route.js";
import kitchenRouter from "./route/kitchen.route.js";
import billShareRouter from "./route/billShare.route.js";
import dashboardRouter from "./route/dashboard.route.js";
import waiterRouter from "./route/waiter.route.js";
import addressRouter from "./route/address.route.js";
import publicRouter from "./route/public.route.js";
import shiftRouter from "./route/shift.route.js";
import notificationRouter from "./route/notification.route.js";

// SOCKET
import { initSocketServer } from "./socket/index.js";

// CRON + ERROR
import { initCronJobs } from "./cron.js";
import { handleJsonError } from "./middleware/handleJsonError.js";
import { requireAuth } from "./middleware/requireAuth.js";

/* ======================================================
   APP SETUP
====================================================== */

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   CORS
====================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  // "https://platoinfinity.xyz",
  // "https://www.platoinfinity.xyz",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-session-token",
      "X-Session-Token",
      "x-customer-session",
    ],
  }),
);

// SAFE PREFLIGHT
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

/* ======================================================
   HEALTH
====================================================== */

app.get("/", (req, res) => res.json({ ok: true, service: "Plato API" }));

app.get("/health", (req, res) => res.json({ ok: true, time: new Date() }));

// TEST ENDPOINT FOR COOKIES
app.get("/api/test/debug", requireAuth, (req, res) => {
  return res.json({
    success: true,
    message: "Debug endpoint - requireAuth passed",
    user: req.user,
    cookies: req.cookies,
  });
});

// DIAGNOSTIC: Check if dashboard route is even being hit
app.use("/api/dashboard", (req, res, next) => {
  console.log("🔍 DASHBOARD REQUEST INTERCEPTED");
  console.log("   URL:", req.originalUrl);
  console.log("   Method:", req.method);
  console.log("   Cookies:", req.cookies);
  console.log(
    "   Auth Header:",
    req.headers.authorization ? "Present" : "Missing",
  );
  next();
});

/* ======================================================
   ROUTES
====================================================== */

app.use("/api/public", publicRouter);
app.use("/api/address", addressRouter);
app.use("/api/master-menu", masterMenuRouter);
app.use("/api/auth/invite", authInviteRouter);

app.use("/api/auth", authRouter);
app.use("/api/brand", brandRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/restaurants/:restaurantId/managers", managerRouter);
app.use("/api", staffRouter);
app.use("/api/shifts", shiftRouter);
app.use("/api/branch-menu", menuRouter);
app.use("/api", sessionRouter);
app.use("/api", orderRouter);
app.use("/api/suspicious", suspiciousRouter);
app.use("/api", kitchenStationRouter);
app.use("/api/customer", customerMenuRouter);
app.use("/api", tableRouter);
app.use("/api", cartRouter);
app.use("/api", billRouter);
app.use("/api", reportRouter);
app.use("/api", whatsappRouter);
app.use("/api/kitchen", kitchenRouter);
app.use("/api", billShareRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/waiter", waiterRouter);
app.use("/api/notifications", notificationRouter);

/* ======================================================
   FRONTEND (VITE BUILD)
====================================================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "..", "client", "dist");

app.use(express.static(clientDistPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

/* ======================================================
   ERROR HANDLER
====================================================== */

app.use(handleJsonError);

/* ======================================================
   SERVER START
====================================================== */

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    initCronJobs();

    const server = http.createServer(app);

    // 🔥 SOCKET INIT (SINGLE SOURCE OF TRUTH)
    const io = initSocketServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    app.locals.io = io;

    server.listen(PORT, () => {
      console.log(`🚀 Plato API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed", err);
    process.exit(1);
  }
}

startServer();
