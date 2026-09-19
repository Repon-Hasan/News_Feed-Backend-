import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { reporterProfileControllers } from "./reporterProfile.controller";


const router = Router();

// Get current reporter profile
router.get(
  "/me",
  checkAuth("REPORTER"),
  reporterProfileControllers.getMyProfile
);

// Update current reporter profile
router.patch(
  "/update/:id",
  checkAuth("REPORTER"),
  reporterProfileControllers.updateMyProfile
);

export const reporterProfileRoutes = router;