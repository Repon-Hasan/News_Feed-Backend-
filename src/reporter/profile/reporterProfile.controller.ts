import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { reporterProfileServices } from "./reporterProfile.service";


const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
   
  const result = await reporterProfileServices.getMyProfile(userId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Reporter profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await reporterProfileServices.updateMyProfile(
    userId,
    req.body
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Reporter profile updated successfully",
    data: result,
  });
});

export const reporterProfileControllers = {
  getMyProfile,
  updateMyProfile,
};