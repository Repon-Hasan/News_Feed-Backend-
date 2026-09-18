import { Router } from "express";
import { authController } from "./auth.controller";
import { multerImageUpload } from "../config/multer";
import { checkAuth } from "../middleware/checkAuth";
import { Role } from "../generated/prisma/enums";



const router=Router();

router.post("/register",multerImageUpload.single("image"),authController.registerUser)
router.post("/login",authController.loginUser)
router.get("/getMe",checkAuth(),authController.getUser)
router.post("/refresh-token", authController.getNewToken)
router.post("/change-password",checkAuth(Role.ADMIN,Role.USER,Role.REPORTER),authController.changePassword)
router.patch("/profile",checkAuth(Role.ADMIN,Role.USER,Role.REPORTER),authController.updateProfile)
// Logout is intentionally idempotent so expired sessions can still be cleared.
router.post("/logout", authController.logoutUser)
router.post("/reset-password", authController.resetPassword)

//Google Login
router.get("/login/google", authController.googleLogin);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/oauth/error", authController.handleOAuthError);

// ==========================================
// Change User Status
// ==========================================

router.patch(
  "/users/:userId/status",
  checkAuth("ADMIN"),
  authController.changeUserStatus
);


router.get(
  "/allCandidates",
  checkAuth(Role.ADMIN,Role.REPORTER),
  authController.getAllCandidates
);

// ==========================================
// Permanently Delete User
// ==========================================

router.delete(
  "/users/:userId",
  checkAuth("ADMIN"),
  authController.deleteUser
);

export const authRouters=router