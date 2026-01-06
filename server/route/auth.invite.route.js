// src/routes/auth.invite.js
import express from "express";
import {
  setPasswordController,
  verifyInviteController,
} from "../controller/auth.invite.controller.js";

const authInviteRouter = express.Router();

// Public route to accept invite
authInviteRouter.get("/verify", verifyInviteController);
authInviteRouter.post("/set-password", setPasswordController);

export default authInviteRouter;
