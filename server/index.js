import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import mongoose from "mongoose";

import connectDB from "./config/connectDB.js";

// ROUTERS
import authRouter from "./route/auth.route.js";
import brandRouter from "./route/brand.route.js";
import restaurantRouter from "./route/restaurant.route.js";
import inviteRouter from "./route/invite.route.js";
import authInviteRouter from "./route/auth.invite.route.js";
import staffRouter from "./route/staff.route.js";
import menuRouter from "./route/menu.route.js";
import sessionRouter from "./route/session.route.js";
import suspiciousRouter from "./route/suspicious.route.js";
import orderRouter from "./route/order.route.js";

// SOCKET SERVER
import { initSocketServer } from "./socket/index.js";
import { registerEmitFunc } from "./socket/emitter.js";
import masterMenuRouter from "./route/masterMenu.route.js";
import kitchenStationRouter from "./route/kitchenStation.route.js";
import customerMenuRouter from "./route/customerMenu.route.js";
import tableRouter from "./route/table.route.js";
import cartRouter from "./route/cart.route.js";
import billRouter from "./route/bill.route.js";
import { initCronJobs } from "./cron.js";
import reportRouter from "./route/report.route.js";
import whatsappRouter from "./route/billWhatsapp.route.js";
import kitchenRouter from "./route/kitchen.route.js";
import billShareRouter from "./route/billShare.route.js";
import dashboardRouter from "./route/dashboard.route.js";
import waiterRouter from "./route/waiter.route.js";
import { handleJsonError } from "./middleware/handleJsonError.js";

// ---------- EXPRESS APP ----------
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// app.get("/", (req, res) => res.json({ message: "Plato API Server", ok: true }));
// app.get("/health", (req, res) => res.json({ ok: true, time: new Date() }));

// ---------- ROUTES ----------
app.use("/api/auth", authRouter);
app.use("/api/brand", brandRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/invite", inviteRouter);
app.use("/api/auth/invite", authInviteRouter);
app.use("/api/staff", staffRouter);
app.use("/api/branch-menu", menuRouter);
app.use("/api", sessionRouter);
app.use("/api", orderRouter);
app.use("/api/suspicious", suspiciousRouter);
app.use("/api/master-menu", masterMenuRouter);
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
app.use(handleJsonError);

// ---------- SERVER + SOCKET ----------
const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    initCronJobs();

    const server = http.createServer(app);

    const { io, emitToStation } = initSocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    app.locals.io = io;
    app.locals.emitToStation = emitToStation;
    registerEmitFunc(emitToStation);

    server.listen(PORT, () =>
      console.log(`🚀 Server listening on PORT ${PORT}`)
    );

    const graceful = async (signal) => {
      console.log(`\nShutting down (${signal})...`);
      server.close(() => console.log("HTTP server closed"));
      await mongoose.disconnect();
      process.exit(0);
    };

    process.on("SIGINT", () => graceful("SIGINT"));
    process.on("SIGTERM", () => graceful("SIGTERM"));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
