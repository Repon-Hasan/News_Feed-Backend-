import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../shared/catchAsync";
import { sendResponse } from "../shared/sendResponse";
import { userService } from "./user.service";
import AppError from "../errorHelpers/AppError";



const getUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new Error("User ID not found");
  }

  return req.user.id;
};

const getMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const result = await userService.getMyProfile(userId);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const result = await userService.updateMyProfile(
      userId,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  }
);

// ==================== ARTICLES ====================

const getPublishedArticles = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.getPublishedArticles(
      req.query
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Articles retrieved successfully",
      data: result,
    });
  }
);

const getArticleById = catchAsync(
  async (req: Request, res: Response) => {
    const articleId = req.params.id;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }

    const result = await userService.getArticleById(articleId);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article retrieved successfully",
      data: result,
    });
  }
);

// ==================== LIKE ====================

const likeArticle = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }

    const result = await userService.likeArticle(
      userId,
      articleId
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Article liked successfully",
      data: result,
    });
  }
);

const unlikeArticle = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }

    const result = await userService.unlikeArticle(
      userId,
      articleId
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article unliked successfully",
      data: result,
    });
  }
);

// ==================== BOOKMARK ====================

const bookmarkArticle = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
      const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }

    const result = await userService.bookmarkArticle(
      userId,
      articleId
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Article bookmarked successfully",
      data: result,
    });
  }
);

const removeBookmark = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
      const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }

    const result = await userService.removeBookmark(
      userId,
      articleId
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Bookmark removed successfully",
      data: result,
    });
  }
);

const getMyBookmarks = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const result = await userService.getMyBookmarks(userId);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Bookmarks retrieved successfully",
      data: result,
    });
  }
);

// ==================== COMMENTS ====================

const createComment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
       const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }
    const result = await userService.createComment(
      userId,
      articleId,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Comment created successfully",
      data: result,
    });
  }
);

const getArticleComments = catchAsync(
  async (req: Request, res: Response) => {
      const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }
    const result = await userService.getArticleComments(
      articleId
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comments retrieved successfully",
      data: result,
    });
  }
);

const deleteMyComment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const commentId = req.params.id;

    if (!commentId || Array.isArray(commentId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid comment ID"
      );
    }

    const result = await userService.deleteMyComment(
      userId,
      commentId
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  }
);

// ==================== REPORT ====================

const reportArticle = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }
    const result = await userService.reportArticle(
      userId,
      articleId,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Article reported successfully",
      data: result,
    });
  }
);

const reportComment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const commentId = req.params.commentId;

    if (!commentId || Array.isArray(commentId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid comment ID"
      );
    }

    const result = await userService.reportComment(
      userId,
      commentId,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Comment reported successfully",
      data: result,
    });
  }
);

const getMyReports = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const result = await userService.getMyReports(userId);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reports retrieved successfully",
      data: result,
    });
  }
);

// ==================== NOTIFICATIONS ====================

const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const result =
      await userService.getMyNotifications(userId);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Notifications retrieved successfully",
      data: result,
    });
  }
);

const markNotificationAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const notificationId = req.params.id;

    if (!notificationId || Array.isArray(notificationId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid notification ID"
      );
    }

    const result = await userService.markNotificationAsRead(
      userId,
      notificationId
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  }
);

// ==================== ARTICLE VIEW ====================

const trackArticleView = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
         const articleId = req.params.articleId;

    if (!articleId || Array.isArray(articleId)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid article ID"
      );
    }
    const result = await userService.trackArticleView(
      articleId,
      userId,
      req.ip,
      req.headers["user-agent"]
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Article view recorded",
      data: result,
    });
  }
);

// ==================== NEWSLETTER ====================

const subscribeNewsletter = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await userService.subscribeNewsletter(req.body);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Subscribed to newsletter successfully",
      data: result,
    });
  }
);

const unsubscribeNewsletter = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await userService.unsubscribeNewsletter(req.body);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Unsubscribed from newsletter successfully",
      data: result,
    });
  }
);

export const userController = {
  getMyProfile,
  updateMyProfile,

  getPublishedArticles,
  getArticleById,

  likeArticle,
  unlikeArticle,

  bookmarkArticle,
  removeBookmark,
  getMyBookmarks,

  createComment,
  getArticleComments,
  deleteMyComment,

  reportArticle,
  reportComment,
  getMyReports,

  getMyNotifications,
  markNotificationAsRead,

  trackArticleView,

  subscribeNewsletter,
  unsubscribeNewsletter,
};