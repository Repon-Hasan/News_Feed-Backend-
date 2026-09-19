import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { reporterControllers } from "./reporter.controller";
import { multerImageUpload } from "../../config/multer";


const router = Router();

// ==================== DASHBOARD ====================

router.get(
  "/dashboard",
  checkAuth("REPORTER"),
  reporterControllers.getDashboard
);

// ==================== ARTICLES ====================

// Create article
router.post(
  "/articles",
  multerImageUpload.single('coverImage'),
  checkAuth("REPORTER"),
  reporterControllers.createArticle
);

// Get all my articles
router.get(
  "/articles",
  checkAuth("REPORTER"),
  reporterControllers.getMyArticles
);

// Get single my article
router.get(
  "/articles/:id",
  checkAuth("REPORTER"),
  reporterControllers.getMyArticle
);

// Update my article
router.patch(
  "/articles/:id",
  checkAuth("REPORTER"),
  reporterControllers.updateArticle
);

// Delete my article
router.delete(
  "/articles/:id",
  checkAuth("REPORTER"),
  reporterControllers.deleteArticle
);

// Submit article for review
router.patch(
  "/articles/:id/submit",
  checkAuth("REPORTER"),
  reporterControllers.submitForReview
);

// ==================== ARTICLE IMAGES ====================

// Add image
router.post(
  "/articles/:articleId/images",
  multerImageUpload.single('url'),
  checkAuth("REPORTER"),
  reporterControllers.addArticleImage
);

// Delete image
router.delete(
  "/articles/:articleId/images/:imageId",
  checkAuth("REPORTER"),
  reporterControllers.deleteArticleImage
);

// ==================== ARTICLE TAGS ====================

// Add tag
router.post(
  "/articles/:articleId/tags",
  checkAuth("REPORTER"),
  reporterControllers.addArticleTag
);

// Remove tag
router.delete(
  "/articles/:articleId/tags/:tagId",
  checkAuth("REPORTER"),
  reporterControllers.removeArticleTag
);

// ==================== COMMENTS ====================

// Get comments of my article
router.get(
  "/articles/:articleId/comments",
  checkAuth("REPORTER"),
  reporterControllers.getArticleComments
);

// Approve comment
router.patch(
  "/comments/:commentId/approve",
  checkAuth("REPORTER"),
  reporterControllers.approveComment
);

// Reject comment
router.patch(
  "/comments/:commentId/reject",
  checkAuth("REPORTER"),
  reporterControllers.rejectComment
);

// Delete comment
router.delete(
  "/comments/:commentId",
  checkAuth("REPORTER"),
  reporterControllers.deleteComment
);

// ==================== REPORTS ====================

// Get reports related to my articles
router.get(
  "/reports",
  checkAuth("REPORTER"),
  reporterControllers.getMyReports
);

export const reporterRoutes = router;