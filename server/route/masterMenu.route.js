import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createCategory,
  createMasterItem,
  createSubcategory,
  deleteCategory,
  deleteMasterItem,
  deleteSubcategory,
  getMasterMenu,
  updateCategory,
  updateMasterItem,
  updateSubcategory,
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

masterMenuRouter.put(
  "/category/:categoryId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  updateCategory
);
masterMenuRouter.delete(
  "/category/:categoryId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  deleteCategory
);

masterMenuRouter.put(
  "/subcategory/:subcategoryId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  updateSubcategory
);
masterMenuRouter.delete(
  "/subcategory/:subcategoryId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  deleteSubcategory
);

masterMenuRouter.put(
  "/item/:itemId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  upload.single("image"),
  updateMasterItem
);
masterMenuRouter.delete(
  "/item/:itemId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  deleteMasterItem
);

/**
 * VIEW MASTER MENU
 */
masterMenuRouter.get("/", requireAuth, getMasterMenu);

export default masterMenuRouter;
