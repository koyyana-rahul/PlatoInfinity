import express from "express";
import {
  statesController,
  districtsController,
  pincodeController,
} from "../controller/address.controller.js";

const router = express.Router();

router.get("/states", statesController);
router.get("/districts", districtsController);
router.get("/pincode", pincodeController);

export default router;
