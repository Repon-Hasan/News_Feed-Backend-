import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


const searchArticles = async (query: any) => {
  const search =
    typeof query.search === "string"
      ? query.search.trim()
      : "";

  const categoryId =
    typeof query.categoryId === "string"
      ? query.categoryId
      : undefined;

  const subcategoryId =
    typeof query.subcategoryId === "string"
      ? query.subcategoryId
      : undefined;

  const tag =
    typeof query.tag === "string"
      ? query.tag.trim()
      : undefined;

  const authorId =
    typeof query.authorId === "string"
      ? query.authorId
      : undefined;

  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(query.limit) || 10, 1),
    50
  );

  const skip = (page - 1) * limit;

  const sort =
    typeof query.sort === "string"
      ? query.sort
      : "latest";

  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
  };

  // =========================
  // SEARCH TEXT
  // =========================

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
      {
        content: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        category: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        subcategory: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        author: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        tags: {
          some: {
            tag: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  // =========================
  // CATEGORY FILTER
  // =========================

  if (categoryId) {
    where.categoryId = categoryId;
  }

  // =========================
  // SUBCATEGORY FILTER
  // =========================

  if (subcategoryId) {
    where.subcategoryId = subcategoryId;
  }

  // =========================
  // TAG FILTER
  // =========================

  if (tag) {
    where.tags = {
      some: {
        tag: {
          OR: [
            {
              name: {
                equals: tag,
                mode: "insensitive",
              },
            },
            {
              slug: {
                equals: tag,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    };
  }

  // =========================
  // AUTHOR FILTER
  // =========================

  if (authorId) {
    where.authorId = authorId;
  }

  // =========================
  // SORTING
  // =========================

  let orderBy: Prisma.ArticleOrderByWithRelationInput;

  switch (sort) {
    case "oldest":
      orderBy = {
        publishedAt: "asc",
      };
      break;

    case "most-viewed":
      orderBy = {
        views: "desc",
      };
      break;

    case "latest":
    default:
      orderBy = {
        publishedAt: "desc",
      };
      break;
  }

  // =========================
  // DATABASE QUERY
  // =========================

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy,

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

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        images: {
          orderBy: {
            order: "asc",
          },
        },

        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
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
      hasNextPage:
        page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },

    filters: {
      search: search || null,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      tag: tag || null,
      authorId: authorId || null,
      sort,
    },

    data: articles,
  };
};

// ======================================
// SEARCH SUGGESTIONS
// ======================================

const getSearchSuggestions = async (query: any) => {
  const search =
    typeof query.search === "string"
      ? query.search.trim()
      : "";

  if (!search) {
    return [];
  }

  const [articles, categories, tags] =
    await Promise.all([
      prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
        },
        take: 5,
        orderBy: {
          publishedAt: "desc",
        },
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 5,
      }),

      prisma.tag.findMany({
        where: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 5,
      }),
    ]);

  return {
    articles,
    categories,
    tags,
  };
};

export const searchService = {
  searchArticles,
  getSearchSuggestions,
};