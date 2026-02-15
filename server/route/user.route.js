import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  updateUserProfileController,
  changePasswordController,
} from "../controller/user.controller.js";

const userRouter = express.Router();

// Update user profile
userRouter.put("/profile", requireAuth, updateUserProfileController);

// Change password
userRouter.post("/change-password", requireAuth, changePasswordController);

export default userRouter;
