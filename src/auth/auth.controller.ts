
import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { catchAsync } from "../shared/catchAsync";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { tokenUtils } from "../utlis/token";
import { sendResponse } from "../shared/sendResponse";
import { CookieUtils } from "../utlis/cookie";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";


// ==========================================
// Register User
// ==========================================
const registerUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await authServices.registerUser(
      payload,
      req.file
    );

    if (
      !result ||
      !("accessToken" in result) ||
      !("refreshToken" in result)
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "User registration failed"
      );
    }

    const {
      accessToken,
      refreshToken,
      token,
      ...rest
    } = result;

    // Set Access Token
    tokenUtils.setAccessTokenCookie(
      res,
      accessToken
    );

    // Set Refresh Token
    tokenUtils.setRefreshTokenCookie(
      res,
      refreshToken
    );

    // Set Better Auth Session Token
    if (token) {
      tokenUtils.setBetterAuthSessionCookie(
        res,
        token as string
      );
    }

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "User registered successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,
      },
    });
  }
);


// ==========================================
// Login User
// ==========================================
const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const result =
      await authServices.loginUser(payload);

    const {
      accessToken,
      refreshToken,
      token,
      ...rest
    } = result;

    // Set Access Token
    tokenUtils.setAccessTokenCookie(
      res,
      accessToken
    );

    // Set Refresh Token
    tokenUtils.setRefreshTokenCookie(
      res,
      refreshToken
    );

    // Set Better Auth Session Token
    if (token) {
      tokenUtils.setBetterAuthSessionCookie(
        res,
        token as string
      );
    }

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User login successful",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,
      },
    });
  }
);


// ==========================================
// Get Current User
// ==========================================
const getUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized user"
      );
    }

    const result =
      await authServices.getMe(user);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result,
    });
  }
);


// ==========================================
// Get New Access Token
// ==========================================
const getNewToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.refreshToken;

    const betterAuthSessionToken =
      req.cookies?.[
        "better-auth.session_token"
      ] as string | undefined;

    if (!refreshToken) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Refresh token is missing"
      );
    }

    if (!betterAuthSessionToken) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Better Auth session token is missing"
      );
    }

    const result =
      await authServices.getNewToken(
        refreshToken,
        betterAuthSessionToken
      );

    const {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken,
    } = result;

    // Set New Access Token
    tokenUtils.setAccessTokenCookie(
      res,
      accessToken
    );

    // Set New Refresh Token
    tokenUtils.setRefreshTokenCookie(
      res,
      newRefreshToken
    );

    // Set New Better Auth Session Token
    if (sessionToken) {
      tokenUtils.setBetterAuthSessionCookie(
        res,
        sessionToken
      );
    }

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken,
      },
    });
  }
);


// ==========================================
// Change Password
// ==========================================
const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const betterAuthSessionToken =
      req.cookies?.[
        "better-auth.session_token"
      ] as string | undefined;

    if (!betterAuthSessionToken) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Better Auth session token is missing"
      );
    }

    const result =
      await authServices.changePassword(
        payload,
        betterAuthSessionToken
      );

    const {
      accessToken,
      refreshToken,
      token,
    } = result;

    // Set New Access Token
    tokenUtils.setAccessTokenCookie(
      res,
      accessToken
    );

    // Set New Refresh Token
    tokenUtils.setRefreshTokenCookie(
      res,
      refreshToken
    );

    // Set Better Auth Session
    if (token) {
      tokenUtils.setBetterAuthSessionCookie(
        res,
        token as string
      );
    }

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
);


// ==========================================
// Update Profile
// ==========================================
const updateProfile = catchAsync(
  async (req: Request, res: Response) => {
    const sessionToken =
      req.cookies?.[
        "better-auth.session_token"
      ] as string | undefined;

    if (!sessionToken) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Better Auth session token is missing"
      );
    }

    const result =
      await authServices.updateProfile(
        req.body,
        sessionToken
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  }
);


// ==========================================
// Logout User
// ==========================================
const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"] as string | undefined;
        const result = await authServices.logoutUser(betterAuthSessionToken);
        CookieUtils.clearCookie(res, 'accessToken', {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
            path: "/",
        });
        CookieUtils.clearCookie(res, 'refreshToken', {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
            path: "/",
        });

        
        CookieUtils.clearCookie(res, 'better-auth.session_token', {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
            path: "/",
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result,
        });
    }
)


// ==========================================
// Verify Email
// ==========================================



// ==========================================
// Forget Password



// ==========================================
// Reset Password
// ==========================================


// auth.controller.ts

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authServices.resetPassword(email, password);

  // // Clear all authentication cookies
  // res.clearCookie("accessToken", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   path: "/",
  // });

  // res.clearCookie("refreshToken", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   path: "/",
  // });

  // // Better Auth session cookie
  // res.clearCookie("better-auth.session_token", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   path: "/",
  // });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message:
      "Password reset successfully. All previous sessions have been logged out.",
    data: result,
  });
});


// auth.services.ts








// ==========================================
// Google Login
// ==========================================
// GET /api/v1/auth/login/google?redirect=/dashboard
// ==========================================
const googleLogin = catchAsync(
  async (req: Request, res: Response) => {
    const redirectPath =
      (req.query.redirect as string) ||
      "/dashboard";

    // Prevent open redirect
    const isValidRedirectPath =
      redirectPath.startsWith("/") &&
      !redirectPath.startsWith("//");

    const finalRedirectPath =
      isValidRedirectPath
        ? redirectPath
        : "/dashboard";

    const encodedRedirectPath =
      encodeURIComponent(
        finalRedirectPath
      );

    const callbackURL =
      `${envVars.BETTER_AUTH_URL}` +
      `/api/v1/auth/google/success` +
      `?redirect=${encodedRedirectPath}`;

    res.render("googleRedirect", {
      callbackURL,
      betterAuthUrl:
        envVars.BETTER_AUTH_URL,
    });
  }
);


// ==========================================
// Google Login Success
// ==========================================
// GET /api/v1/auth/google/success
// ==========================================
const googleLoginSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const redirectPath =
      (req.query.redirect as string) ||
      "/dashboard";

    // ==========================================
    // Validate Redirect
    // ==========================================

    const isValidRedirectPath =
      redirectPath.startsWith("/") &&
      !redirectPath.startsWith("//");

    const finalRedirectPath =
      isValidRedirectPath
        ? redirectPath
        : "/dashboard";


    // ==========================================
    // Get Better Auth Session Cookie
    // ==========================================

    const sessionToken =
      req.cookies?.[
        "better-auth.session_token"
      ] as string | undefined;

    if (!sessionToken) {
      return res.redirect(
        `${envVars.FRONTEND_URL}` +
        `/login?error=oauth_failed`
      );
    }


    // ==========================================
    // Get Better Auth Session
    // ==========================================

    const session =
      await auth.api.getSession({
        headers: {
          Cookie:
            `better-auth.session_token=${sessionToken}`,
        },
      });

    if (!session) {
      return res.redirect(
        `${envVars.FRONTEND_URL}` +
        `/login?error=no_session_found`
      );
    }

    if (!session.user) {
      return res.redirect(
        `${envVars.FRONTEND_URL}` +
        `/login?error=no_user_found`
      );
    }


    // ==========================================
    // Create Application JWT Tokens
    // ==========================================

    const result =
      await authServices.googleLoginSuccess(
        session
      );

    const {
      accessToken,
      refreshToken,
    } = result;


    // ==========================================
    // Set Application Cookies
    // ==========================================

    tokenUtils.setAccessTokenCookie(
      res,
      accessToken
    );

    tokenUtils.setRefreshTokenCookie(
      res,
      refreshToken
    );


    // ==========================================
    // Redirect Frontend
    // ==========================================

    res.redirect(
      `${envVars.FRONTEND_URL}${finalRedirectPath}`
    );
  }
);


// ==========================================
// Google OAuth Error
// ==========================================
const handleOAuthError = catchAsync(
  async (req: Request, res: Response) => {
    const error =
      (req.query.error as string) ||
      "oauth_failed";

    res.redirect(
      `${envVars.FRONTEND_URL}` +
      `/login?error=${encodeURIComponent(error)}`
    );
  }
);


// ==========================================
// Change User Status
// ==========================================
const changeUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId =
      Array.isArray(req.params.userId)
        ? req.params.userId[0]
        : req.params.userId;

    const { status: userStatus } =
      req.body;

    if (!userId) {
      throw new AppError(
        status.BAD_REQUEST,
        "User ID is required"
      );
    }

    if (!userStatus) {
      throw new AppError(
        status.BAD_REQUEST,
        "User status is required"
      );
    }

    const result =
      await authServices.changeUserStatus(
        userId,
        userStatus
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message:
        "User status updated successfully",
      data: result,
    });
  }
);


// ==========================================
// Delete User
// ==========================================
const deleteUser = catchAsync(
  async (req: Request, res: Response) => {
    const userId =
      Array.isArray(req.params.userId)
        ? req.params.userId[0]
        : req.params.userId;

    if (!userId) {
      throw new AppError(
        status.BAD_REQUEST,
        "User ID is required"
      );
    }

    const result =
      await authServices.deleteUser(
        userId
      );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message:
        "User deleted successfully",
      data: result,
    });
  }
);


// ==========================================
// Get All Candidates
// ==========================================
const getAllCandidates = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await authServices.getAllUsers();

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message:
        "Candidates retrieved successfully",
      data: result,
    });
  }
);


// ==========================================
// Export Controller
// ==========================================
export const authController = {
  registerUser,
  loginUser,
  getUser,
  getNewToken,
  changePassword,
  updateProfile,
  logoutUser,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
  changeUserStatus,
  deleteUser,
  getAllCandidates,
};

