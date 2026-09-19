

// ==================== PROFILE ====================

import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      reporterProfile: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateMyProfile = async (
  userId: string,
  payload: {
    name?: string;
    image?: string;
  }
) => {
  const data: Prisma.UserUpdateInput = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.image !== undefined) {
    data.image = payload.image;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
    include: {
      reporterProfile: true,
    },
  });
};

// ==================== ARTICLES ====================

const getPublishedArticles = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search =
    typeof query.search === "string"
      ? query.search
      : undefined;

  const categoryId =
    typeof query.categoryId === "string"
      ? query.categoryId
      : undefined;

  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
  };

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        excerpt: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            reporterProfile: {
              select: {
                designation: true,
                isVerified: true,
              },
            },
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
        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
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

const getArticleById = async (articleId: string) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
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
      _count: {
        select: {
          comments: true,
          likes: true,
          bookmarks: true,
          articleViews: true,
        },
      },
    },
  });

  if (!article) {
    throw new Error("Published article not found");
  }

  return article;
};

// ==================== LIKE ====================

const likeArticle = async (
  userId: string,
  articleId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "PUBLISHED",
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });

  if (existingLike) {
    return existingLike;
  }

  return prisma.like.create({
    data: {
      userId,
      articleId,
    },
  });
};

const unlikeArticle = async (
  userId: string,
  articleId: string
) => {
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });

  if (!existingLike) {
    throw new Error("Article is not liked");
  }

  return prisma.like.delete({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
};

// ==================== BOOKMARK ====================

const bookmarkArticle = async (
  userId: string,
  articleId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "PUBLISHED",
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const existingBookmark =
    await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

  if (existingBookmark) {
    return existingBookmark;
  }

  return prisma.bookmark.create({
    data: {
      userId,
      articleId,
    },
  });
};

const removeBookmark = async (
  userId: string,
  articleId: string
) => {
  const existingBookmark =
    await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

  if (!existingBookmark) {
    throw new Error("Bookmark not found");
  }

  return prisma.bookmark.delete({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
};

const getMyBookmarks = async (userId: string) => {
  return prisma.bookmark.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      article: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
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
        },
      },
    },
  });
};

// ==================== COMMENTS ====================

const createComment = async (
  userId: string,
  articleId: string,
  payload: {
    content?: string;
    parentId?: string;
  }
) => {
  if (!payload.content?.trim()) {
    throw new Error("Comment content is required");
  }

  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "PUBLISHED",
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (payload.parentId) {
    const parentComment =
      await prisma.comment.findUnique({
        where: {
          id: payload.parentId,
        },
      });

    if (
      !parentComment ||
      parentComment.articleId !== articleId
    ) {
      throw new Error("Parent comment not found");
    }
  }

  return prisma.comment.create({
    data: {
      content: payload.content.trim(),
      articleId,
      userId,
      parentId: payload.parentId || null,
      status: "APPROVED",
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
  });
};

const getArticleComments = async (
  articleId: string
) => {
  return prisma.comment.findMany({
    where: {
      articleId,
      status: "APPROVED",
      parentId: null,
    },
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
      replies: {
        where: {
          status: "APPROVED",
        },
        orderBy: {
          createdAt: "asc",
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
    },
  });
};

const deleteMyComment = async (
  userId: string,
  commentId: string
) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error(
      "You can only delete your own comment"
    );
  }

  return prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};

// ==================== REPORTS ====================

const reportArticle = async (
  userId: string,
  articleId: string,
  payload: {
    reason?: string;
  }
) => {
  if (!payload.reason?.trim()) {
    throw new Error("Report reason is required");
  }

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  return prisma.report.create({
    data: {
      reason: payload.reason.trim(),
      userId,
      articleId,
    },
  });
};

const reportComment = async (
  userId: string,
  commentId: string,
  payload: {
    reason?: string;
  }
) => {
  if (!payload.reason?.trim()) {
    throw new Error("Report reason is required");
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return prisma.report.create({
    data: {
      reason: payload.reason.trim(),
      userId,
      commentId,
    },
  });
};

const getMyReports = async (userId: string) => {
  return prisma.report.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
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
  });
};

// ==================== NOTIFICATIONS ====================

const getMyNotifications = async (
  userId: string
) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const markNotificationAsRead = async (
  userId: string,
  notificationId: string
) => {
  const notification =
    await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new Error(
      "You cannot update this notification"
    );
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      read: true,
    },
  });
};

// ==================== ARTICLE VIEW ====================

const trackArticleView = async (
  articleId: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      status: "PUBLISHED",
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const view = await prisma.articleView.create({
    data: {
      articleId,
      userId: userId || null,
      ipHash: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  await prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return view;
};

// ==================== NEWSLETTER ====================

const subscribeNewsletter = async (payload: {
  email?: string;
}) => {
  if (!payload.email?.trim()) {
    throw new Error("Email is required");
  }

  const email = payload.email
    .trim()
    .toLowerCase();

  const existing =
    await prisma.newsletterSubscription.findUnique({
      where: {
        email,
      },
    });

  if (existing) {
    if (!existing.isActive) {
      return prisma.newsletterSubscription.update({
        where: {
          id: existing.id,
        },
        data: {
          isActive: true,
        },
      });
    }

    return existing;
  }

  return prisma.newsletterSubscription.create({
    data: {
      email,
    },
  });
};

const unsubscribeNewsletter = async (payload: {
  email?: string;
}) => {
  if (!payload.email?.trim()) {
    throw new Error("Email is required");
  }

  const email = payload.email
    .trim()
    .toLowerCase();

  const subscription =
    await prisma.newsletterSubscription.findUnique({
      where: {
        email,
      },
    });

  if (!subscription) {
    throw new Error(
      "Newsletter subscription not found"
    );
  }

  return prisma.newsletterSubscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      isActive: false,
    },
  });
};

export const userService = {
  getMyProfile,
  updateMyProfile,

  getPublishedArticles,
  getArticleById,

  likeArticle,
  unlikeArticle,

  bookmarkArticle,
  removeBookmark,
  getMyBookmarks,

  createComment,
  getArticleComments,
  deleteMyComment,

  reportArticle,
  reportComment,
  getMyReports,

  getMyNotifications,
  markNotificationAsRead,

  trackArticleView,

  subscribeNewsletter,
  unsubscribeNewsletter,
};