import express from "express";
import { sendBillLink } from "../controller/billShare.controller.js";

const billShareRouter = express.Router();

billShareRouter.post("/:billId/share", sendBillLink);

export default billShareRouter;
