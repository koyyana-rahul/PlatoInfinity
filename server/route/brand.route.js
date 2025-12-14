// src/routes/brands.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createBrandController,
  listBrandsController,
} from "../controller/brand.controller.js";
import upload from "../config/multer.js";

const brandRouter = express.Router();

// Only brand admins can create and list their brands
brandRouter.post(
  "/",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  upload.single("logo"),
  createBrandController
);
brandRouter.get(
  "/",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  listBrandsController
);
export default brandRouter;
