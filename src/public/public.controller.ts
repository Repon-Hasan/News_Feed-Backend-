
import { Request, Response } from "express";
import status from "http-status";
import { publicServices } from "./public.service";
import { catchAsync } from "../shared/catchAsync";
import { sendResponse } from "../shared/sendResponse";


const getAllArticles = catchAsync(
  async (req: Request, res: Response) => {
    const result = await publicServices.getAllArticles(req.query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Articles retrieved successfully",
      data: result,
    });
  }
);

export const publicControllers = {
  getAllArticles,
};

