import status from "http-status";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRequestUser,
  IUpdateProfilePayload,
} from "./auth.interface";

import { JwtPayload } from "jsonwebtoken";

import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../config/cloudnary.config";

import { auth } from "../lib/auth";
import AppError from "../errorHelpers/AppError";
import { tokenUtils } from "../utlis/token";
import { Role } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utlis/jwt";
import { envVars } from "../config/env";

// ==========================================
// Register User
// ==========================================
interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const registerUser = async (
  payload: IRegisterPatientPayload,
  file?: Express.Multer.File
) => {
  const { name, email, password } = payload;

  // ==========================================
  // 1. Upload Image
  // ==========================================
  let imageUrl: string | undefined;

  if (file) {
    const uploadedImage = await uploadFileToCloudinary(
      file.buffer,
      file.originalname
    );

    imageUrl = uploadedImage.secure_url;
  }

  // ==========================================
  // 2. Create User with Better Auth
  // ==========================================
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      image: imageUrl,
    },
  });

  if (!data.user) {
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to register user"
    );
  }

  try {
    // ==========================================
    // 3. Update User Role
    // ==========================================
    const user = await prisma.user.update({
      where: {
        id: data.user.id,
      },
      data: {
        role: payload.role,
        emailVerified: true,
      },
    });

    // ==========================================
    // 4. Create Reporter Profile
    // ==========================================
    if (payload.role === "REPORTER") {
      await prisma.reporterProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // ==========================================
    // 5. Generate Access Token
    // ==========================================
    const accessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    // ==========================================
    // 6. Generate Refresh Token
    // ==========================================
    const refreshToken = tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    // ==========================================
    // 7. Return
    // ==========================================
    return {
      ...data,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("Registration error:", error);

    // Delete created user if anything fails
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });

    throw error;
  }
};

// ==========================================
// Login User
// ==========================================
const loginUser = async (
  payload: ILoginUserPayload
) => {
  const { email, password } = payload;

  // ==========================================
  // 1. Better Auth Login
  // ==========================================
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid email or password"
    );
  }

  // ==========================================
  // 2. Get User From Database
  // ==========================================
  const user = await prisma.user.findUnique({
    where: {
      id: data.user.id,
    },
  });

  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "User not found"
    );
  }

  // ==========================================
  // 3. Check Active Status
  // ==========================================
  if (!user.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account is inactive"
    );
  }

  // ==========================================
  // 4. Generate Access Token
  // ==========================================
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  // ==========================================
  // 5. Generate Refresh Token
  // ==========================================
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

// ==========================================
// Get Current User
// ==========================================
const getMe = async (user: IRequestUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      reporterProfile: true,
    },
  });

  if (!existingUser) {
    throw new AppError(
      status.NOT_FOUND,
      "User not found"
    );
  }

  return existingUser;
};

// ==========================================
// Get New Access Token
// ==========================================
const getNewToken = async (
  refreshToken: string,
  sessionToken: string
) => {
  // ==========================================
  // 1. Check Session
  // ==========================================
  const existingSession =
    await prisma.session.findUnique({
      where: {
        token: sessionToken,
      },
      include: {
        user: true,
      },
    });

  if (!existingSession) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid session token"
    );
  }

  // ==========================================
  // 2. Check Session Expiration
  // ==========================================
  if (existingSession.expiresAt < new Date()) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Session has expired"
    );
  }

  // ==========================================
  // 3. Verify Refresh Token
  // ==========================================
  const verifiedRefreshToken =
    jwtUtils.verifyToken(
      refreshToken,
      envVars.REFRESH_TOKEN_SECRET
    );

  if (
    !verifiedRefreshToken.success ||
    !verifiedRefreshToken.data
  ) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid refresh token"
    );
  }

  const data =
    verifiedRefreshToken.data as JwtPayload;

  // ==========================================
  // 4. Make Sure Token Belongs To Session User
  // ==========================================
  if (
    data.userId !== existingSession.userId
  ) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid refresh token"
    );
  }

  // ==========================================
  // 5. Check User
  // ==========================================
  const user = existingSession.user;

  if (!user.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "User account is inactive"
    );
  }

  // ==========================================
  // 6. Generate New Access Token
  // ==========================================
  const newAccessToken =
    tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  // ==========================================
  // 7. Generate New Refresh Token
  // ==========================================
  const newRefreshToken =
    tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  // ==========================================
  // 8. Update Session
  // ==========================================
  const updatedSession =
    await prisma.session.update({
      where: {
        token: sessionToken,
      },
      data: {
        expiresAt: new Date(
          Date.now() +
            60 * 60 * 24 * 30 * 1000
        ),
        updatedAt: new Date(),
      },
    });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: updatedSession.token,
  };
};

// ==========================================
// Change Password
// ==========================================
const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string
) => {
  // ==========================================
  // 1. Check Session
  // ==========================================
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid session token"
    );
  }

  // ==========================================
  // 2. Change Password
  // ==========================================
  const result =
    await auth.api.changePassword({
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        revokeOtherSessions: true,
      },
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });

  // ==========================================
  // 3. Get Updated User
  // ==========================================
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "User not found"
    );
  }

  // ==========================================
  // 4. Generate New Tokens
  // ==========================================
  const accessToken =
    tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  const refreshToken =
    tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

// ==========================================
// Logout User
// ==========================================
const logoutUser = async (
  sessionToken?: string
) => {
  if (!sessionToken) {
    return {
      success: true,
    };
  }

  return auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
};

// ==========================================
// Update Profile
// ==========================================
const updateProfile = async (
  payload: IUpdateProfilePayload,
  sessionToken?: string
) => {
  // ==========================================
  // 1. Check Session Token
  // ==========================================
  if (!sessionToken) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Session token is missing"
    );
  }

  // ==========================================
  // 2. Get Session
  // ==========================================
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid session token"
    );
  }

  // ==========================================
  // 3. Verify Current Password
  // ==========================================
  if (!payload.currentPassword) {
    throw new AppError(
      status.BAD_REQUEST,
      "Current password is required"
    );
  }

  await auth.api.verifyPassword({
    body: {
      password: payload.currentPassword,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // ==========================================
  // 4. Validate Name
  // ==========================================
  const cleanName =
    typeof payload.name === "string"
      ? payload.name.trim()
      : undefined;

  if (
    cleanName !== undefined &&
    cleanName.length < 2
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Name must be at least 2 characters"
    );
  }

  // ==========================================
  // 5. Update User
  // ==========================================
  const updatedUser =
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(cleanName !== undefined
          ? {
              name: cleanName,
            }
          : {}),

        ...(payload.image !== undefined
          ? {
              image: payload.image,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  // ==========================================
  // 6. Update Reporter Profile
  // ==========================================
  if (session.user.role === Role.REPORTER) {
    const reporterData = {
      bio: payload.bio,
      designation: payload.designation,
      phone: payload.phone,
      twitter: payload.twitter,
      facebook: payload.facebook,
    };

    const filteredData = Object.fromEntries(
      Object.entries(reporterData).filter(
        ([, value]) => value !== undefined
      )
    );

    if (Object.keys(filteredData).length > 0) {
      await prisma.reporterProfile.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
          ...filteredData,
        },
        update: {
          ...filteredData,
        },
      });
    }
  }

  return updatedUser;
};

// ==========================================
// Request Password Reset OTP
// ==========================================

import { hashPassword } from "better-auth/crypto";
// change path if needed

const resetPassword = async (
  email: string,
  newPassword: string
) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // 2. Check account status
  if (!user.isActive) {
    throw new AppError(status.FORBIDDEN, "User account is inactive");
  }

  // 3. Find credentials account
  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
  });

  if (!account) {
    throw new AppError(
      status.NOT_FOUND,
      "Password account not found"
    );
  }

  // 4. Hash new password
 const hashedPassword = await hashPassword(newPassword);

  // 5. Update password + remove all sessions
  await prisma.$transaction([
    prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        password: hashedPassword,
      },
    }),

    prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    }),
  ]);

  return {
    message: "Password updated successfully",
  };
};






// ==========================================
// Google Login Success
// ==========================================
const googleLoginSuccess = async (
  session: Record<string, any>
) => {
  // ==========================================
  // 1. Validate Session
  // ==========================================
  if (!session?.user?.id) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Invalid Google session"
    );
  }

  // ==========================================
  // 2. Find User
  // ==========================================
  let user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // ==========================================
  // 3. Create User If Missing
  // ==========================================
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: Role.USER,
        isActive: true,
      },
    });
  }

  // ==========================================
  // 4. Check Active Status
  // ==========================================
  if (!user.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "User account is inactive"
    );
  }

  // ==========================================
  // 5. Generate Access Token
  // ==========================================
  const accessToken =
    tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  // ==========================================
  // 6. Generate Refresh Token
  // ==========================================
  const refreshToken =
    tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

  return {
    accessToken,
    refreshToken,
    user,
  };
};

// ==========================================
// Change User Active Status
// ==========================================
const changeUserStatus = async (
  userId: string,
  isActive: boolean
) => {
  // ==========================================
  // 1. Find User
  // ==========================================
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "User not found"
    );
  }

  // ==========================================
  // 2. Update Status
  // ==========================================
  const updatedUser =
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

  // ==========================================
  // 3. Remove Sessions If Deactivated
  // ==========================================
  if (!isActive) {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  return updatedUser;
};

// ==========================================
// Delete User
// ==========================================
const deleteUser = async (
  userId: string
) => {
  // ==========================================
  // 1. Find User
  // ==========================================
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "User not found"
    );
  }

  // ==========================================
  // 2. Prevent Admin Deletion
  // ==========================================
  if (user.role === Role.ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "Admin user cannot be deleted"
    );
  }

  // ==========================================
  // 3. Delete User
  // ==========================================
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  // ==========================================
  // 4. Delete Cloudinary Image
  // ==========================================
  if (user.image) {
    try {
      await deleteFileFromCloudinary(
        user.image
      );
    } catch (error) {
      console.error(
        "Cloudinary image deletion failed:",
        error
      );
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    message: "User deleted successfully",
  };
};

// ==========================================
// Get All Reporters
// ==========================================
const getAllReporters = async () => {
  return prisma.user.findMany({
    where: {
      role: Role.REPORTER,
    },
    include: {
      reporterProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// Get All Users
// ==========================================
const getAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      reporterProfile: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// Export Services
// ==========================================
export const authServices = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  updateProfile,
  logoutUser,
  resetPassword,
  googleLoginSuccess,
  changeUserStatus,
  deleteUser,
  getAllReporters,
  getAllUsers,
};