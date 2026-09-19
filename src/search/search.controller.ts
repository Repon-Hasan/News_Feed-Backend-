import { Request, Response } from "express";
import status from "http-status";


import { searchService } from "./search.service";
import { sendResponse } from "../shared/sendResponse";
import { catchAsync } from "../shared/catchAsync";

const searchArticles = catchAsync(
  async (req: Request, res: Response) => {
    const result = await searchService.searchArticles(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Search results retrieved successfully",
      data: result,
    });
  }
);

const getSearchSuggestions = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await searchService.getSearchSuggestions(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Search suggestions retrieved successfully",
      data: result,
    });
  }
);

export const searchController = {
  searchArticles,
  getSearchSuggestions,
};