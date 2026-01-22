import express from "express";
import { getPublicTableController } from "../controller/table.controller.js";
import {
  getCustomerMenuByTableController,
  getPublicMenuItemController,
} from "../controller/customerMenu.controller.js";

const publicRouter = express.Router();

publicRouter.get("/table/:tableId", getPublicTableController);
publicRouter.get("/table/:tableId/menu", getCustomerMenuByTableController);
publicRouter.get("/menu-item/:branchMenuItemId", getPublicMenuItemController);

export default publicRouter;
