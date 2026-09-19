import { uploadFileToCloudinary } from "../../config/cloudnary.config";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createArticle = async (
  userId: string,
  payload: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;

    // Controller sends req.file here
    coverImage?: Express.Multer.File;

    coverImageCaption?: string;
    categoryId: string;
    subcategoryId?: string;
    readingTime?: string | number;
    seoTitle?: string;
    seoDescription?: string;
    isFeatured?: string | boolean;
    isBreaking?: string | boolean;
    isTrending?: string | boolean;
  }
) => {
  // Check reporter
  const reporter = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!reporter || reporter.role !== "REPORTER") {
    throw new Error("Only reporters can create articles");
  }

  // Check duplicate slug
  const existingSlug = await prisma.article.findUnique({
    where: {
      slug: payload.slug,
    },
  });

  if (existingSlug) {
    throw new Error("An article with this slug already exists");
  }

  // Check category
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Check subcategory
  if (payload.subcategoryId) {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        id: payload.subcategoryId,
        categoryId: payload.categoryId,
      },
    });

    if (!subcategory) {
      throw new Error(
        "Subcategory does not belong to the selected category"
      );
    }
  }

  // Convert readingTime from string to number
  const readingTime = payload.readingTime
    ? Number(payload.readingTime)
    : 1;

  // Validate readingTime
  if (Number.isNaN(readingTime) || readingTime < 1) {
    throw new Error("Reading time must be a valid positive number");
  }

  // ==========================================
  // Upload cover image
  // ==========================================

  let coverImageUrl: string | undefined;

  if (payload.coverImage) {
    const uploadedImage = await uploadFileToCloudinary(
      payload.coverImage.buffer,
      payload.coverImage.originalname
    );

    coverImageUrl = uploadedImage.secure_url;
  }

  // ==========================================
  // Create article
  // ==========================================

  return prisma.article.create({
    data: {
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt,
      content: payload.content,

      // String URL goes to Prisma
      coverImage: coverImageUrl,
      coverImageCaption: payload.coverImageCaption,

      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId,

      readingTime,

      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,

      isFeatured: false,
      isBreaking: false,
      isTrending: false,

      authorId: userId,
      status: "DRAFT",
    },

    include: {
      category: true,
      subcategory: true,
      images: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};


const getMyArticles = async (
  userId: string,
  query: any
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.ArticleWhereInput = {
    authorId: userId,
  };

  if (query.status) {
    where.status = query.status;
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
        excerpt: {
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

const getMyArticle = async (
  userId: string,
  articleId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
    include: {
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

const updateArticle = async (
  userId: string,
  articleId: string,
  payload: any
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found or you are not the owner");
  }

  // Published/approved article should not be freely edited.
  if (
    article.status === "PUBLISHED" ||
    article.status === "APPROVED"
  ) {
    throw new Error(
      "Published or approved articles cannot be directly edited"
    );
  }

  if (payload.slug && payload.slug !== article.slug) {
    const slugExists = await prisma.article.findFirst({
      where: {
        slug: payload.slug,
        NOT: {
          id: articleId,
        },
      },
    });

    if (slugExists) {
      throw new Error("Slug already exists");
    }
  }

  if (
    payload.categoryId &&
    payload.subcategoryId
  ) {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        id: payload.subcategoryId,
        categoryId: payload.categoryId,
      },
    });

    if (!subcategory) {
      throw new Error(
        "Subcategory does not belong to selected category"
      );
    }
  }

  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt,
      content: payload.content,
      coverImage: payload.coverImage,
      coverImageCaption: payload.coverImageCaption,
      categoryId: payload.categoryId,
      subcategoryId: payload.subcategoryId,
      readingTime: payload.readingTime,
      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,

      // Reporter should not control these flags
      // isFeatured,
      // isBreaking,
      // isTrending,
    },
    include: {
      category: true,
      subcategory: true,
      images: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

const deleteArticle = async (
  userId: string,
  articleId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (article.status === "PUBLISHED") {
    throw new Error(
      "Published article cannot be deleted by reporter"
    );
  }

  await prisma.article.delete({
    where: {
      id: articleId,
    },
  });

  return null;
};

const submitForReview = async (
  userId: string,
  articleId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (
    article.status !== "DRAFT" &&
    article.status !== "REJECTED"
  ) {
    throw new Error(
      "Only draft or rejected articles can be submitted"
    );
  }

  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      status: "PENDING_REVIEW",
      rejectionReason: null,
    },
  });
};

const addArticleImage = async (
  userId: string,
  articleId: string,
  payload: {
    url: string;
    caption?: string;
    altText?: string;
    order?: number;
  }
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (article.status === "PUBLISHED") {
    throw new Error(
      "Cannot modify images of a published article"
    );
  }

  return prisma.articleImage.create({
    data: {
      articleId,
      url: payload.url,
      caption: payload.caption,
      altText: payload.altText,
      order: payload.order ?? 0,
    },
  });
};

const deleteArticleImage = async (
  userId: string,
  articleId: string,
  imageId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const image = await prisma.articleImage.findFirst({
    where: {
      id: imageId,
      articleId,
    },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  await prisma.articleImage.delete({
    where: {
      id: imageId,
    },
  });

  return null;
};

const addArticleTag = async (
  userId: string,
  articleId: string,
  payload: {
    tagId?: string;
    name?: string;
  }
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  if (!payload.tagId && !payload.name) {
    throw new Error("tagId or tag name is required");
  }

  let tagId = payload.tagId;

  if (!tagId && payload.name) {
    const slug = payload.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const tag = await prisma.tag.upsert({
      where: {
        slug,
      },
      update: {},
      create: {
        name: payload.name.trim(),
        slug,
      },
    });

    tagId = tag.id;
  }

  if (!tagId) {
    throw new Error("Tag ID is required");
  }

  const tag = await prisma.tag.findUnique({
    where: {
      id: tagId,
    },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }

  return prisma.articleTag.create({
    data: {
      articleId,
      tagId,
    },
    include: {
      tag: true,
    },
  });
};

const removeArticleTag = async (
  userId: string,
  articleId: string,
  tagId: string
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  await prisma.articleTag.delete({
    where: {
      articleId_tagId: {
        articleId,
        tagId,
      },
    },
  });

  return null;
};

const getArticleComments = async (
  userId: string,
  articleId: string,
  query: any
) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: userId,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.CommentWhereInput = {
    articleId,
  };

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
        replies: {
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
    }),

    prisma.comment.count({
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
    data: comments,
  };
};

const getOwnedComment = async (
  userId: string,
  commentId: string
) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      article: {
        authorId: userId,
      },
    },
  });

  if (!comment) {
    throw new Error(
      "Comment not found or it does not belong to your article"
    );
  }

  return comment;
};

const approveComment = async (
  userId: string,
  commentId: string
) => {
  await getOwnedComment(userId, commentId);

  return prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      status: "APPROVED",
    },
  });
};

const rejectComment = async (
  userId: string,
  commentId: string
) => {
  await getOwnedComment(userId, commentId);

  return prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      status: "REJECTED",
    },
  });
};

const deleteComment = async (
  userId: string,
  commentId: string
) => {
  await getOwnedComment(userId, commentId);

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  return null;
};

const getMyReports = async (
  userId: string,
  query: any
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.ReportWhereInput = {
    article: {
      authorId: userId,
    },
  };

  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({
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
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    }),

    prisma.report.count({
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
    data: reports,
  };
};

const getDashboard = async (userId: string) => {
  const [
    totalArticles,
    draftArticles,
    pendingArticles,
    approvedArticles,
    publishedArticles,
    rejectedArticles,
    totalViews,
    totalComments,
    totalLikes,
    totalBookmarks,
    totalReports,
  ] = await Promise.all([
    prisma.article.count({
      where: {
        authorId: userId,
      },
    }),

    prisma.article.count({
      where: {
        authorId: userId,
        status: "DRAFT",
      },
    }),

    prisma.article.count({
      where: {
        authorId: userId,
        status: "PENDING_REVIEW",
      },
    }),

    prisma.article.count({
      where: {
        authorId: userId,
        status: "APPROVED",
      },
    }),

    prisma.article.count({
      where: {
        authorId: userId,
        status: "PUBLISHED",
      },
    }),

    prisma.article.count({
      where: {
        authorId: userId,
        status: "REJECTED",
      },
    }),

    prisma.articleView.count({
      where: {
        article: {
          authorId: userId,
        },
      },
    }),

    prisma.comment.count({
      where: {
        article: {
          authorId: userId,
        },
      },
    }),

    prisma.like.count({
      where: {
        article: {
          authorId: userId,
        },
      },
    }),

    prisma.bookmark.count({
      where: {
        article: {
          authorId: userId,
        },
      },
    }),

    prisma.report.count({
      where: {
        article: {
          authorId: userId,
        },
      },
    }),
  ]);

  return {
    articles: {
      total: totalArticles,
      draft: draftArticles,
      pendingReview: pendingArticles,
      approved: approvedArticles,
      published: publishedArticles,
      rejected: rejectedArticles,
    },

    engagement: {
      views: totalViews,
      comments: totalComments,
      likes: totalLikes,
      bookmarks: totalBookmarks,
      reports: totalReports,
    },
  };
};

export const reporterServices = {
  getDashboard,
  createArticle,
  getMyArticles,
  getMyArticle,
  updateArticle,
  deleteArticle,
  submitForReview,
  addArticleImage,
  deleteArticleImage,
  addArticleTag,
  removeArticleTag,
  getArticleComments,
  approveComment,
  rejectComment,
  deleteComment,
  getMyReports,
};