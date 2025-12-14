// src/routes/auth.invite.js
import express from "express";
import { acceptInviteController } from "../controller/auth.invite.controller.js";

const authInviteRouter = express.Router();

// Public route to accept invite
authInviteRouter.post("/accept-invite", acceptInviteController);

export default authInviteRouter;
