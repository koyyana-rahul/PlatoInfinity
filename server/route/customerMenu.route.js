import express from "express";
import { getCustomerMenuController } from "../controller/customerMenu.controller.js";

const customerMenuRouter = express.Router();

/**
 * PUBLIC CUSTOMER MENU
 * Used by:
 * - QR scan
 * - Customer phone
 * - Waiter tablet
 *
 * No auth required
 */
customerMenuRouter.get("/menu/:restaurantId", getCustomerMenuController);

export default customerMenuRouter;
