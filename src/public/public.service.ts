
import { ArticleStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const getAllArticles = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = query.search as string | undefined;
  const categoryId = query.categoryId as string | undefined;

  const where = {
    status: ArticleStatus.PUBLISHED,

    ...(categoryId && {
      categoryId,
    }),

    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: true,
        author: true,
      },
    }),

    prisma.article.count({
      where,
    }),
  ]);

  return {
    data: articles,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};





export const publicServices = {
  getAllArticles,
};

