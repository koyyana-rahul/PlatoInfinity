import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/connectDB.js";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE"],
  })
);

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server listening on PORT: ", PORT);
  });
});
