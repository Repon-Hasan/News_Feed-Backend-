import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { adminServices } from "./admin.services";


const getDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getDashboard();

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Admin dashboard retrieved successfully",
      data: result,
    });
  }
);

// ======================================================
// USERS
// ======================================================

const getUsers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getUsers(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  }
);

const getUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getUser(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  }
);

const getUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new Error("User not authenticated");
  }

  return req.user.id;
};
const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.updateUserStatus(
      getUserId(req),                 // logged-in user's ID
      req.params.id as string,        // target user's ID
      req.body.isActive
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  }
);

const updateUserRole = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.updateUserRole(
      req.params.id as string,
      req.body.role
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User role updated successfully",
      data: result,
    });
  }
);

const deleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.deleteUser(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  }
);

// ======================================================
// REPORTERS
// ======================================================

const getReporters = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getReporters(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reporters retrieved successfully",
      data: result,
    });
  }
);

const getReporter = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getReporter(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reporter retrieved successfully",
      data: result,
    });
  }
);

const verifyReporter = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.verifyReporter(
      req.params.id as string,
      req.body.isVerified
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reporter verification updated successfully",
      data: result,
    });
  }
);


// ======================================================
// ARTICLES
// ======================================================

const getArticles = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getArticles(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Articles retrieved successfully",
      data: result,
    });
  }
);

const getArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getArticle(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article retrieved successfully",
      data: result,
    });
  }
);

const approveArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.approveArticle(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article approved successfully",
      data: result,
    });
  }
);

const rejectArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.rejectArticle(
      req.params.id as string,
      req.body.rejectionReason
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article rejected successfully",
      data: result,
    });
  }
);

const publishArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.publishArticle(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article published successfully",
      data: result,
    });
  }
);

const archiveArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.archiveArticle(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article archived successfully",
      data: result,
    });
  }
);

const toggleFeatured = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.toggleFeatured(
      req.params.id as string,
      req.body.isFeatured
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Featured status updated successfully",
      data: result,
    });
  }
);

const toggleBreaking = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.toggleBreaking(
      req.params.id as string,
      req.body.isBreaking
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Breaking status updated successfully",
      data: result,
    });
  }
);

const toggleTrending = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.toggleTrending(
      req.params.id as string,
      req.body.isTrending
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trending status updated successfully",
      data: result,
    });
  }
);

const deleteArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.deleteArticle(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article deleted successfully",
      data: result,
    });
  }
);

// ======================================================
// COMMENTS
// ======================================================

const getComments = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getComments(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comments retrieved successfully",
      data: result,
    });
  }
);

const approveComment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.approveComment(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comment approved successfully",
      data: result,
    });
  }
);

const rejectComment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.rejectComment(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comment rejected successfully",
      data: result,
    });
  }
);

const deleteComment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.deleteComment(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  }
);

// ======================================================
// REPORTS
// ======================================================

const getReports = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getReports(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reports retrieved successfully",
      data: result,
    });
  }
);

const deleteReport = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.deleteReport(
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Report deleted successfully",
      data: result,
    });
  }
);

// ======================================================
// ADVERTISEMENTS
// ======================================================

const createAdvertisement = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.createAdvertisement(req.body);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Advertisement created successfully",
      data: result,
    });
  }
);

const getAdvertisements = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.getAdvertisements(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Advertisements retrieved successfully",
      data: result,
    });
  }
);

const getAdvertisement = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.getAdvertisement(
        req.params.id as string
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Advertisement retrieved successfully",
      data: result,
    });
  }
);

const updateAdvertisement = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.updateAdvertisement(
        req.params.id as string,
        req.body
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Advertisement updated successfully",
      data: result,
    });
  }
);

const deleteAdvertisement = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.deleteAdvertisement(
        req.params.id as string
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Advertisement deleted successfully",
      data: result,
    });
  }
);

// ======================================================
// NEWSLETTER
// ======================================================

const getNewsletterSubscribers = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.getNewsletterSubscribers(
        req.query
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Newsletter subscribers retrieved successfully",
      data: result,
    });
  }
);

const updateNewsletterStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.updateNewsletterStatus(
        req.params.id as string,
        req.body.isActive
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Newsletter status updated successfully",
      data: result,
    });
  }
);

const deleteNewsletterSubscriber = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await adminServices.deleteNewsletterSubscriber(
        req.params.id as string
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Newsletter subscriber deleted successfully",
      data: result,
    });
  }
);

export const adminControllers = {
  getDashboard,

  getUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,

  getReporters,
  getReporter,
  verifyReporter,



  getArticles,
  getArticle,
  approveArticle,
  rejectArticle,
  publishArticle,
  archiveArticle,
  toggleFeatured,
  toggleBreaking,
  toggleTrending,
  deleteArticle,

  getComments,
  approveComment,
  rejectComment,
  deleteComment,

  getReports,
  deleteReport,

  createAdvertisement,
  getAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,

  getNewsletterSubscribers,
  updateNewsletterStatus,
  deleteNewsletterSubscriber,
};