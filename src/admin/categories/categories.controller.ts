import { Request, Response } from "express";



import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { categoryService } from "./categories.service";



const getAllCategories = catchAsync(
  async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === "true";

    const result = await categoryService.getAllCategories(
      includeInactive
    );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  }
);

const getCategoryBySlug = catchAsync(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
if (typeof slug !== "string") {
  throw new AppError(400, "Slug is required");
}
    const result = await categoryService.getCategoryBySlug(slug);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  }
);

const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await categoryService.createCategory(req.body);

    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  }
);

const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
if (typeof id !== "string") {
  throw new AppError(400, "Slug is required");
}
    const result = await categoryService.updateCategory(
      id,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  }
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
if (typeof id !== "string") {
  throw new AppError(400, "Slug is required");
}
    const result = await categoryService.deleteCategory(id);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  }
);

const createSubcategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await categoryService.createSubcategory(
      req.body
    );

    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Subcategory created successfully",
      data: result,
    });
  }
);

const updateSubcategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
if (typeof id !== "string") {
  throw new AppError(400, "Slug is required");
}
    const result = await categoryService.updateSubcategory(
      id,
      req.body
    );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Subcategory updated successfully",
      data: result,
    });
  }
);

const deleteSubcategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
if (typeof id !== "string") {
  throw new AppError(400, "Slug is required");
}
    const result = await categoryService.deleteSubcategory(id);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Subcategory deleted successfully",
      data: result,
    });
  }
);

export const categoryController = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};