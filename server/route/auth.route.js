import express from "express";
import {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
  refreshTokenController,
  forgotPasswordController,
  verifyForgotPasswordOtpController,
  resetPasswordController,
  // uploadAvatarController,
  updateUserDetailsController,
  userDetailsController,
  uploadAvatarController,
  // setPasswordController,
} from "../controller/auth.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";
import upload from "../config/multer.js";
// import { acceptInviteController } from "../controller/auth.invite.controller.js";
// import { acceptInviteController } from "../controller/invite.controller.js";

const authRouter = express.Router();

/**
 * PUBLIC ROUTES
 */
authRouter.post("/register", registerUserController); // signup (brand admin / user)
authRouter.get("/verify-email", verifyEmailController); // email verification
authRouter.post("/login", loginController); // login
authRouter.post("/refresh-token", refreshTokenController); // get new access token

// forgot password flow
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/verify-forgot-otp", verifyForgotPasswordOtpController);
authRouter.post("/reset-password", resetPasswordController);

/**
 * PROTECTED ROUTES (require auth)
 */
authRouter.post("/logout", requireAuth, logoutController);
authRouter.post(
  "/upload-avatar",
  requireAuth,
  upload.single("avatar"),
  uploadAvatarController
);

authRouter.put("/update-profile", requireAuth, updateUserDetailsController);
authRouter.get("/me", requireAuth, userDetailsController);
// authRouter.post("/accept-invite", acceptInviteController);
// authRouter.post("/set-password", setPasswordController);

export default authRouter;
