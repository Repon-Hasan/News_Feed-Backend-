import { Router } from "express";
import { checkAuth } from "../middleware/checkAuth";
import { userController } from "./user.controller";


const router = Router();

// ==================== PROFILE ====================

router.get(
  "/me",
  checkAuth("USER"),
  userController.getMyProfile
);

router.patch(
  "/me",
  checkAuth("USER"),
  userController.updateMyProfile
);

// ==================== ARTICLES ====================

router.get(
  "/articles",
  userController.getPublishedArticles
);

router.get(
  "/articles/:id",
  userController.getArticleById
);

// ==================== LIKE ====================

router.post(
  "/articles/:articleId/like",
  checkAuth("USER"),
  userController.likeArticle
);

router.delete(
  "/articles/:articleId/like",
  checkAuth("USER"),
  userController.unlikeArticle
);

// ==================== BOOKMARK ====================

router.post(
  "/articles/:articleId/bookmark",
  checkAuth("USER"),
  userController.bookmarkArticle
);

router.delete(
  "/articles/:articleId/bookmark",
  checkAuth("USER"),
  userController.removeBookmark
);

router.get(
  "/bookmarks",
  checkAuth("USER"),
  userController.getMyBookmarks
);

// ==================== COMMENTS ====================

router.post(
  "/articles/:articleId/comments",
  checkAuth("USER"),
  userController.createComment
);

router.get(
  "/articles/:articleId/comments",
  userController.getArticleComments
);

router.delete(
  "/comments/:id",
  checkAuth("USER"),
  userController.deleteMyComment
);

// ==================== REPORTS ====================

router.post(
  "/articles/:articleId/report",
  checkAuth("USER"),
  userController.reportArticle
);

router.post(
  "/comments/:commentId/report",
  checkAuth("USER"),
  userController.reportComment
);

router.get(
  "/reports",
  checkAuth("USER"),
  userController.getMyReports
);

// ==================== NOTIFICATIONS ====================

router.get(
  "/notifications",
  checkAuth("USER"),
  userController.getMyNotifications
);

router.patch(
  "/notifications/:id/read",
  checkAuth("USER"),
  userController.markNotificationAsRead
);

// ==================== ARTICLE VIEW ====================

router.post(
  "/articles/:articleId/view",
  userController.trackArticleView
);

// ==================== NEWSLETTER ====================

router.post(
  "/newsletter/subscribe",
  userController.subscribeNewsletter
);

router.patch(
  "/newsletter/unsubscribe",
  userController.unsubscribeNewsletter
);

export const userRoutes = router;