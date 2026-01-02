// src/routes/masterMenu.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import upload from "../config/multer.js";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategories,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
  getMasterMenu,
  getMasterMenuTree,
} from "../controller/masterMenu.controller.js";
import { uploadMultipleImages } from "../config/multerMultiImages.js";

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
masterMenuRouter.get(
  "/categories",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  getCategories
);

masterMenuRouter.post(
  "/subcategory",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  createSubcategory
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
masterMenuRouter.get(
  "/categories/:categoryId/subcategories",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  getSubcategories
);

masterMenuRouter.post(
  "/item",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  uploadMultipleImages.array("images", 5),
  createMasterItem
);
masterMenuRouter.put(
  "/item/:itemId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  uploadMultipleImages.array("images", 5),
  updateMasterItem
);
masterMenuRouter.delete(
  "/item/:itemId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  deleteMasterItem
);

/**
 * READ
 */
masterMenuRouter.get("/", requireAuth, getMasterMenu);
masterMenuRouter.get("/tree", requireAuth, getMasterMenuTree);

export default masterMenuRouter;
