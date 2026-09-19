import { error } from "node:console";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";



const getAllCategories = async (includeInactive = false) => {
  return prisma.category.findMany({
    where: includeInactive
      ? {}
      : {
          isActive: true,
        },

    orderBy: {
      order: "asc",
    },

    include: {
      subcategories: {
        where: includeInactive
          ? {}
          : {
              isActive: true,
            },
        orderBy: {
          name: "asc",
        },
      },

      _count: {
        select: {
          articles: {
            where: {
              status: "PUBLISHED",
            },
          },
        },
      },
    },
  });
};

const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },

    include: {
      subcategories: {
        where: {
          isActive: true,
        },

        orderBy: {
          name: "asc",
        },
      },

      _count: {
        select: {
          articles: {
            where: {
              status: "PUBLISHED",
            },
          },
        },
      },
    },
  });

if (!category) {
  throw new AppError(
    404,
    `বিভাগ পাওয়া যায়নি (Category '${slug}' not found)`
  );
}

  return category;
};

const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingCategory) {
    throw new AppError(
       404,
      "এই স্ল্যাগ দিয়ে ইতিমধ্যে একটি বিভাগ বিদ্যমান"
    );
  }

  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
    },
  });
};

const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }
) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError( 404,"Category not found");
  }

  if (data.slug && data.slug !== category.slug) {
    const existingCategory = await prisma.category.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingCategory) {
      throw new AppError(
         404,
        "এই স্ল্যাগ দিয়ে ইতিমধ্যে একটি বিভাগ বিদ্যমান"
      );
    }
  }

  return prisma.category.update({
    where: {
      id,
    },

    data,
  });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    throw new AppError( 404,"Category not found");
  }

  return prisma.category.delete({
    where: {
      id,
    },
  });
};

const createSubcategory = async (data: {
  name: string;
  slug: string;
  categoryId: string;
  isActive?: boolean;
}) => {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    throw new AppError( 404,"Category not found");
  }

  const existingSubcategory = await prisma.subcategory.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingSubcategory) {
    throw new AppError(
       404,
      "এই স্ল্যাগ দিয়ে ইতিমধ্যে একটি উপ-বিভাগ বিদ্যমান"
    );
  }

  return prisma.subcategory.create({
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      isActive: data.isActive ?? true,
    },
  });
};

const updateSubcategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    categoryId?: string;
    isActive?: boolean;
  }
) => {
  const subcategory = await prisma.subcategory.findUnique({
    where: {
      id,
    },
  });

  if (!subcategory) {
    throw new AppError( 404,"Subcategory not found");
  }

  if (data.slug && data.slug !== subcategory.slug) {
    const existing = await prisma.subcategory.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existing) {
      throw new AppError(
         404,
        "এই স্ল্যাগ দিয়ে ইতিমধ্যে একটি উপ-বিভাগ বিদ্যমান"
      );
    }
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      throw new AppError(
         404,
        "New category not found"
      );
    }
  }

  return prisma.subcategory.update({
    where: {
      id,
    },

    data,
  });
};

const deleteSubcategory = async (id: string) => {
  const subcategory = await prisma.subcategory.findUnique({
    where: {
      id,
    },
  });

  if (!subcategory) {
    throw new AppError(
       404,
      "Subcategory not found"
    );
  }

  return prisma.subcategory.delete({
    where: {
      id,
    },
  });
};

export const categoryService = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};