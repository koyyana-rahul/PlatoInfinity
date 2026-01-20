import express from "express";
import { getPublicTableController } from "../controller/table.controller.js";
import { getCustomerMenuByTableController } from "../controller/customerMenu.controller.js";

const publicRouter = express.Router();

publicRouter.get("/table/:tableId", getPublicTableController);
publicRouter.get("/table/:tableId/menu", getCustomerMenuByTableController);

export default publicRouter;
