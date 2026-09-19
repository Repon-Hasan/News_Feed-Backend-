import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";


const getMyProfile = async (userId: string) => {
  const profile = await prisma.reporterProfile.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          isActive: true,
        },
      },
    },
  });

  if (!profile) {
    throw new AppError(404, "Reporter profile not found");
  }

  return profile;
};

const updateMyProfile = async (
  userId: string,
  payload: {
    bio?: string;
    designation?: string;
    phone?: string;
    twitter?: string;
    facebook?: string;
  }
) => {
  const existingProfile = await prisma.reporterProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!existingProfile) {
    throw new AppError(404, "Reporter profile not found");
  }

  const updatedProfile = await prisma.reporterProfile.update({
    where: {
      userId,
    },
    data: {
      ...(payload.bio !== undefined && {
        bio: payload.bio,
      }),

      ...(payload.designation !== undefined && {
        designation: payload.designation,
      }),

      ...(payload.phone !== undefined && {
        phone: payload.phone,
      }),

      ...(payload.twitter !== undefined && {
        twitter: payload.twitter,
      }),

      ...(payload.facebook !== undefined && {
        facebook: payload.facebook,
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
  });

  return updatedProfile;
};

export const reporterProfileServices = {
  getMyProfile,
  updateMyProfile,
};