import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { reporterServices } from "./reporter.service";
import { uploadFileToCloudinary } from "../../config/cloudnary.config";
import AppError from "../../errorHelpers/AppError";


const getUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new Error("Authenticated user ID not found");
  }

  return req.user.id;
};

const getDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.getDashboard(
      getUserId(req)
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reporter dashboard retrieved successfully",
      data: result,
    });
  }
);

const createArticle = catchAsync(
  async (req: Request, res: Response) => {
      console.log("REQ.FILE:", req.file);
    const result = await reporterServices.createArticle(
      getUserId(req),
      {
        ...req.body,
        coverImage: req.file,
      }
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Article created successfully",
      data: result,
    });
  }
);

const getMyArticles = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.getMyArticles(
      getUserId(req),
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

const getMyArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.getMyArticle(
      getUserId(req),
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

const updateArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.updateArticle(
      getUserId(req),
      req.params.id as string,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article updated successfully",
      data: result,
    });
  }
);

const deleteArticle = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.deleteArticle(
      getUserId(req),
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

const submitForReview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.submitForReview(
      getUserId(req),
      req.params.id as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article submitted for review successfully",
      data: result,
    });
  }
);

const addArticleImage = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(
        status.BAD_REQUEST,
        "Image file is required"
      );
    }

    const uploadResult = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const result = await reporterServices.addArticleImage(
      getUserId(req),
      req.params.articleId as string,
      {
        url: uploadResult.secure_url,
        caption: req.body.caption,
        altText: req.body.altText,
        order: req.body.order
          ? Number(req.body.order)
          : 0,
      }
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Article image added successfully",
      data: result,
    });
  }
);

const deleteArticleImage = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.deleteArticleImage(
      getUserId(req),
      req.params.articleId as string,
      req.params.imageId as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article image deleted successfully",
      data: result,
    });
  }
);

const addArticleTag = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.addArticleTag(
      getUserId(req),
      req.params.articleId as string,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Tag added successfully",
      data: result,
    });
  }
);

const removeArticleTag = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.removeArticleTag(
      getUserId(req),
      req.params.articleId as string,
      req.params.tagId as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Tag removed successfully",
      data: result,
    });
  }
);

const getArticleComments = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.getArticleComments(
      getUserId(req),
      req.params.articleId as string,
      req.query
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Article comments retrieved successfully",
      data: result,
    });
  }
);

const approveComment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.approveComment(
      getUserId(req),
      req.params.commentId as string
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
    const result = await reporterServices.rejectComment(
      getUserId(req),
      req.params.commentId as string
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
    const result = await reporterServices.deleteComment(
      getUserId(req),
      req.params.commentId as string
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  }
);

const getMyReports = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reporterServices.getMyReports(
      getUserId(req),
      req.query
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reports retrieved successfully",
      data: result,
    });
  }
);

export const reporterControllers = {
  getDashboard,
  createArticle,
  getMyArticles,
  getMyArticle,
  updateArticle,
  deleteArticle,
  submitForReview,
  addArticleImage,
  deleteArticleImage,
  addArticleTag,
  removeArticleTag,
  getArticleComments,
  approveComment,
  rejectComment,
  deleteComment,
  getMyReports,
};