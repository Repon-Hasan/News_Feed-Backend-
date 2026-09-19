import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

// ======================================================
// DASHBOARD
// ======================================================

const getDashboard = async () => {
  const [
    totalUsers,
    totalReporters,
    totalAdmins,
    totalArticles,
    pendingArticles,
    publishedArticles,
    rejectedArticles,
    totalComments,
    pendingComments,
    totalReports,
    totalAdvertisements,
    totalSubscribers,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: "REPORTER",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    prisma.article.count(),

    prisma.article.count({
      where: {
        status: "PENDING_REVIEW",
      },
    }),

    prisma.article.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.article.count({
      where: {
        status: "REJECTED",
      },
    }),

    prisma.comment.count(),

    prisma.comment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.report.count(),

    prisma.advertisement.count(),

    prisma.newsletterSubscription.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      reporters: totalReporters,
      admins: totalAdmins,
    },

    articles: {
      total: totalArticles,
      pendingReview: pendingArticles,
      published: publishedArticles,
      rejected: rejectedArticles,
    },

    comments: {
      total: totalComments,
      pending: pendingComments,
    },

    reports: totalReports,

    advertisements: totalAdvertisements,

    newsletterSubscribers: totalSubscribers,
  };
};

// ======================================================
// USERS
// ======================================================

const getUsers = async (query: any) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        reporterProfile: true,
        _count: {
          select: {
            articles: true,
            comments: true,
          },
        },
      },
    }),

    prisma.user.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  };
};

const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },

    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      reporterProfile: true,

      _count: {
        select: {
          articles: true,
          comments: true,
          bookmarks: true,
          likes: true,
          reports: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUserStatus = async (
  currentUserId: string,
  targetUserId: string,
  isActive: boolean
) => {
  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be boolean");
  }

  if (currentUserId === targetUserId) {
    throw new Error("You cannot change your own status");
  }

  return prisma.user.update({
    where: {
      id: targetUserId,
    },
    data: {
      isActive,
    },
  });
};

const updateUserRole = async (
  id: string,
  role: "USER" | "REPORTER" | "ADMIN"
) => {
  if (!["USER", "REPORTER", "ADMIN"].includes(role)) {
    throw new Error("Invalid role");
  }

  return prisma.user.update({
    where: { id },
    data: { role },
  });
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: { id },
  });

  return null;
};

// ======================================================
// REPORTERS
// ======================================================

const getReporters = async (query: any) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role: "REPORTER",
  };

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [reporters, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reporterProfile: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
    }),

    prisma.user.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reporters,
  };
};

const getReporter = async (id: string) => {
  const reporter = await prisma.user.findFirst({
    where: {
      id,
      role: "REPORTER",
    },
    include: {
      reporterProfile: true,
      articles: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!reporter) {
    throw new Error("Reporter not found");
  }

  return reporter;
};

const verifyReporter = async (
  id: string,
  isVerified: boolean
) => {
  const reporter = await prisma.user.findFirst({
    where: {
      id,
      role: "REPORTER",
    },
  });

  if (!reporter) {
    throw new Error("Reporter not found");
  }

  return prisma.reporterProfile.update({
    where: {
      userId: id,
    },
    data: {
      isVerified,
    },
  });
};


// ======================================================
// ARTICLES
// ======================================================

const getArticles = async (query: any) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.ArticleWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.authorId) {
    where.authorId = query.authorId;
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },

        category: true,
        subcategory: true,

        images: true,

        tags: {
          include: {
            tag: true,
          },
        },

        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
            articleViews: true,
            reports: true,
          },
        },
      },
    }),

    prisma.article.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: articles,
  };
};

const getArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },

    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          reporterProfile: true,
        },
      },

      category: true,
      subcategory: true,

      images: {
        orderBy: {
          order: "asc",
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },

      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },

      _count: {
        select: {
          comments: true,
          likes: true,
          bookmarks: true,
          articleViews: true,
          reports: true,
        },
      },
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  return article;
};

const approveArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (article.status !== "PENDING_REVIEW") {
    throw new Error(
      "Only pending articles can be approved"
    );
  }

  return prisma.article.update({
    where: { id },

    data: {
      status: "APPROVED",
      rejectionReason: null,
    },
  });
};

const rejectArticle = async (
  id: string,
  rejectionReason: string
) => {
  if (!rejectionReason?.trim()) {
    throw new Error("Rejection reason is required");
  }

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (article.status !== "PENDING_REVIEW") {
    throw new Error(
      "Only pending articles can be rejected"
    );
  }

  return prisma.article.update({
    where: { id },

    data: {
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
    },
  });
};

const publishArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (
    article.status !== "APPROVED"
  ) {
    throw new Error(
      "Only approved articles can be published"
    );
  }

  return prisma.article.update({
    where: { id },

    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
};

const archiveArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  return prisma.article.update({
    where: { id },

    data: {
      status: "ARCHIVED",
    },
  });
};

const toggleFeatured = async (
  id: string,
  isFeatured: boolean
) => {
  return prisma.article.update({
    where: { id },

    data: {
      isFeatured,
    },
  });
};

const toggleBreaking = async (
  id: string,
  isBreaking: boolean
) => {
  return prisma.article.update({
    where: { id },

    data: {
      isBreaking,
    },
  });
};

const toggleTrending = async (
  id: string,
  isTrending: boolean
) => {
  return prisma.article.update({
    where: { id },

    data: {
      isTrending,
    },
  });
};

const deleteArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  await prisma.article.delete({
    where: { id },
  });

  return null;
};

// ======================================================
// COMMENTS
// ======================================================

const getComments = async (query: any) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.CommentWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    }),

    prisma.comment.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: comments,
  };
};

const approveComment = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return prisma.comment.update({
    where: { id },
    data: {
      status: "APPROVED",
    },
  });
};

const rejectComment = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return prisma.comment.update({
    where: { id },
    data: {
      status: "REJECTED",
    },
  });
};

const deleteComment = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  await prisma.comment.delete({
    where: { id },
  });

  return null;
};

// ======================================================
// REPORTS
// ======================================================

const getReports = async (query: any) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },

        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    }),

    prisma.report.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reports,
  };
};

const deleteReport = async (id: string) => {
  const report = await prisma.report.findUnique({
    where: { id },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  await prisma.report.delete({
    where: { id },
  });

  return null;
};

// ======================================================
// ADVERTISEMENTS
// ======================================================

const createAdvertisement = async (payload: any) => {
  return prisma.advertisement.create({
    data: {
      title: payload.title,
      imageUrl: payload.imageUrl,
      targetUrl: payload.targetUrl,
      placement: payload.placement,
      isActive: payload.isActive ?? true,
      startDate: payload.startDate
        ? new Date(payload.startDate)
        : undefined,
      endDate: payload.endDate
        ? new Date(payload.endDate)
        : undefined,
    },
  });
};

const getAdvertisements = async (query: any) => {
  const where: Prisma.AdvertisementWhereInput = {};

  if (query.placement) {
    where.placement = query.placement;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  }

  return prisma.advertisement.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAdvertisement = async (id: string) => {
  const advertisement =
    await prisma.advertisement.findUnique({
      where: { id },
    });

  if (!advertisement) {
    throw new Error("Advertisement not found");
  }

  return advertisement;
};

const updateAdvertisement = async (
  id: string,
  payload: any
) => {
  const advertisement =
    await prisma.advertisement.findUnique({
      where: { id },
    });

  if (!advertisement) {
    throw new Error("Advertisement not found");
  }

  return prisma.advertisement.update({
    where: { id },

    data: {
      title: payload.title,
      imageUrl: payload.imageUrl,
      targetUrl: payload.targetUrl,
      placement: payload.placement,
      isActive: payload.isActive,

      startDate:
        payload.startDate !== undefined
          ? payload.startDate
            ? new Date(payload.startDate)
            : null
          : undefined,

      endDate:
        payload.endDate !== undefined
          ? payload.endDate
            ? new Date(payload.endDate)
            : null
          : undefined,
    },
  });
};

const deleteAdvertisement = async (id: string) => {
  const advertisement =
    await prisma.advertisement.findUnique({
      where: { id },
    });

  if (!advertisement) {
    throw new Error("Advertisement not found");
  }

  await prisma.advertisement.delete({
    where: { id },
  });

  return null;
};

// ======================================================
// NEWSLETTER
// ======================================================

const getNewsletterSubscribers = async (
  query: any
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.NewsletterSubscriptionWhereInput =
    {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive === "true";
  }

  const [subscribers, total] =
    await prisma.$transaction([
      prisma.newsletterSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.newsletterSubscription.count({
        where,
      }),
    ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: subscribers,
  };
};

const updateNewsletterStatus = async (
  id: string,
  isActive: boolean
) => {
  return prisma.newsletterSubscription.update({
    where: { id },
    data: {
      isActive,
    },
  });
};

const deleteNewsletterSubscriber = async (
  id: string
) => {
  await prisma.newsletterSubscription.delete({
    where: { id },
  });

  return null;
};

// ======================================================
// EXPORT
// ======================================================

export const adminServices = {
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