import { NextFunction, Request, Response } from "express";
import status from "http-status";

import { Role } from "../generated/prisma/client";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utlis/cookie";
import { jwtUtils } from "../utlis/jwt";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ================================
      // AUTH DEBUG
      // ================================
      console.log("========== AUTH DEBUG ==========");
      console.log("Request URL:", req.originalUrl);
      console.log("Method:", req.method);
      console.log("Origin:", req.headers.origin);
      console.log("Cookies:", req.cookies);

      console.log(
        "accessToken:",
        !!req.cookies?.accessToken
      );

      console.log("================================");

      // ================================
      // 1. GET ACCESS TOKEN
      // ================================
      const accessToken = CookieUtils.getCookie(
        req,
        "accessToken"
      );

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided."
        );
      }

      // ================================
      // 2. VERIFY ACCESS TOKEN
      // ================================
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET
      );

      if (!verifiedToken.success || !verifiedToken.data) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token."
        );
      }

      const payload = verifiedToken.data;

      // ================================
      // 3. CHECK USER ID
      // ================================
      if (!payload.userId) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid token payload."
        );
      }

      // ================================
      // 4. GET USER FROM DATABASE
      // ================================
      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

      if (!user) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! User not found."
        );
      }

      // ================================
      // 5. CHECK USER ACTIVE STATUS
      // ================================
      if (!user.isActive) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! User is inactive."
        );
      }

      // ================================
      // 6. CHECK USER ROLE
      // ================================
      if (
        authRoles.length > 0 &&
        !authRoles.includes(user.role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource."
        );
      }

      // ================================
      // 7. ATTACH USER TO REQUEST
      // ================================
      req.user = {
        id: user.id,
        userId: user.id,
        role: user.role,
        email: user.email,
      };

      // ================================
      // DEBUG
      // ================================
      console.log("Authenticated user:", {
        id: user.id,
        role: user.role,
        email: user.email,
      });

      console.log("================================");

      // ================================
      // 8. CONTINUE
      // ================================
      next();
    } catch (error) {
      next(error);
    }
  };