import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { adminControllers } from "./admin.controller";


const router = Router();

// ======================================================
// DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  checkAuth("ADMIN"),
  adminControllers.getDashboard
);

// ======================================================
// USERS
// ======================================================

router.get(
  "/users",
  checkAuth("ADMIN"),
  adminControllers.getUsers
);

router.get(
  "/users/:id",
  checkAuth("ADMIN"),
  adminControllers.getUser
);

router.patch(
  "/users/:id/status",
  checkAuth("ADMIN"),
  adminControllers.updateUserStatus
);

router.patch(
  "/users/:id/role",
  checkAuth("ADMIN"),
  adminControllers.updateUserRole
);

router.delete(
  "/users/:id",
  checkAuth("ADMIN"),
  adminControllers.deleteUser
);

// ======================================================
// REPORTERS
// ======================================================

router.get(
  "/reporters",
  checkAuth("ADMIN"),
  adminControllers.getReporters
);

router.get(
  "/reporters/:id",
  checkAuth("ADMIN"),
  adminControllers.getReporter
);

router.patch(
  "/reporters/:id/verify",
  checkAuth("ADMIN"),
  adminControllers.verifyReporter
);

// ======================================================
// ARTICLES
// ======================================================

router.get(
  "/articles",
  checkAuth("ADMIN"),
  adminControllers.getArticles
);

router.get(
  "/articles/:id",
  checkAuth("ADMIN"),
  adminControllers.getArticle
);

router.patch(
  "/articles/:id/approve",
  checkAuth("ADMIN"),
  adminControllers.approveArticle
);

router.patch(
  "/articles/:id/reject",
  checkAuth("ADMIN"),
  adminControllers.rejectArticle
);

router.patch(
  "/articles/:id/publish",
  checkAuth("ADMIN"),
  adminControllers.publishArticle
);

router.patch(
  "/articles/:id/archive",
  checkAuth("ADMIN"),
  adminControllers.archiveArticle
);

router.patch(
  "/articles/:id/feature",
  checkAuth("ADMIN"),
  adminControllers.toggleFeatured
);

router.patch(
  "/articles/:id/breaking",
  checkAuth("ADMIN"),
  adminControllers.toggleBreaking
);

router.patch(
  "/articles/:id/trending",
  checkAuth("ADMIN"),
  adminControllers.toggleTrending
);

router.delete(
  "/articles/:id",
  checkAuth("ADMIN"),
  adminControllers.deleteArticle
);

// ======================================================
// COMMENTS
// ======================================================

router.get(
  "/comments",
  checkAuth("ADMIN"),
  adminControllers.getComments
);

router.patch(
  "/comments/:id/approve",
  checkAuth("ADMIN"),
  adminControllers.approveComment
);

router.patch(
  "/comments/:id/reject",
  checkAuth("ADMIN"),
  adminControllers.rejectComment
);

router.delete(
  "/comments/:id",
  checkAuth("ADMIN"),
  adminControllers.deleteComment
);

// ======================================================
// REPORTS
// ======================================================

router.get(
  "/reports",
  checkAuth("ADMIN"),
  adminControllers.getReports
);

router.delete(
  "/reports/:id",
  checkAuth("ADMIN"),
  adminControllers.deleteReport
);

// ======================================================
// ADVERTISEMENTS
// ======================================================

router.post(
  "/advertisements",
  checkAuth("ADMIN"),
  adminControllers.createAdvertisement
);

router.get(
  "/advertisements",
  checkAuth("ADMIN"),
  adminControllers.getAdvertisements
);

router.get(
  "/advertisements/:id",
  checkAuth("ADMIN"),
  adminControllers.getAdvertisement
);

router.patch(
  "/advertisements/:id",
  checkAuth("ADMIN"),
  adminControllers.updateAdvertisement
);

router.delete(
  "/advertisements/:id",
  checkAuth("ADMIN"),
  adminControllers.deleteAdvertisement
);

// ======================================================
// NEWSLETTER
// ======================================================

router.get(
  "/newsletter",
  checkAuth("ADMIN"),
  adminControllers.getNewsletterSubscribers
);

router.patch(
  "/newsletter/:id/status",
  checkAuth("ADMIN"),
  adminControllers.updateNewsletterStatus
);

router.delete(
  "/newsletter/:id",
  checkAuth("ADMIN"),
  adminControllers.deleteNewsletterSubscriber
);

export const adminRoutes = router;

