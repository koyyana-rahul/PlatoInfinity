import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createCategory,
  createMasterItem,
  createSubcategory,
  getMasterMenu,
} from "../controller/masterMenu.controller.js";
import upload from "../config/multer.js";

const masterMenuRouter = express.Router();

/**
 * BRAND ADMIN ONLY
 */
masterMenuRouter.post(
  "/category",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  createCategory
);

masterMenuRouter.post(
  "/subcategory",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  createSubcategory
);

masterMenuRouter.post(
  "/item",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  upload.single("image"),
  createMasterItem
);

/**
 * VIEW MASTER MENU
 */
masterMenuRouter.get("/", requireAuth, getMasterMenu);

export default masterMenuRouter;
