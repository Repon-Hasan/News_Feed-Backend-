import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleFilterDto,
} from './dto/article.dto';
import { generateSlug } from '../common/utils/slug.util';
import { ArticleStatus, Role } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: ArticleFilterDto, isStaff = false) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(filter.limit) || 12));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Public users can only see published articles
    if (!isStaff) {
      where.status = ArticleStatus.PUBLISHED;
    } else if (filter.status) {
      where.status = filter.status;
    }

    if (filter.category) {
      where.category = {
        slug: filter.category,
      };
    }

    if (filter.tag) {
      where.tags = {
        some: {
          tag: {
            slug: filter.tag,
          },
        },
      };
    }

    if (filter.authorId) {
      where.authorId = filter.authorId;
    }

    if (filter.isBreaking !== undefined) {
      where.isBreaking = filter.isBreaking;
    }

    if (filter.isFeatured !== undefined) {
      where.isFeatured = filter.isFeatured;
    }

    if (filter.isTrending !== undefined) {
      where.isTrending = filter.isTrending;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { excerpt: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          publishedAt: 'desc',
        },
        include: {
          category: true,
          subcategory: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              reporterProfile: true,
            },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true, likes: true, bookmarks: true },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string, ipHash?: string, userId?: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            reporterProfile: true,
          },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { comments: true, likes: true, bookmarks: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি (Article not found)');
    }

    // Increment view asynchronously with lightweight deduplication
    this.recordView(article.id, ipHash, userId).catch(() => {});

    return article;
  }

  async findById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            reporterProfile: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    return article;
  }

  async create(authorId: string, dto: CreateArticleDto, userRole: Role) {
    const slug = dto.slug ? generateSlug(dto.slug) : generateSlug(dto.title);

    // Calculate reading time roughly: 200 words per minute
    const wordCount = dto.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const calculatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Connect tags or create them
    const tagConnectOrCreate = (dto.tags || []).map((tagName) => {
      const tagSlug = generateSlug(tagName);
      return {
        tag: {
          connectOrCreate: {
            where: { slug: tagSlug },
            create: { name: tagName, slug: tagSlug },
          },
        },
      };
    });

    const isDirectAdminPublish = userRole === Role.ADMIN && dto.isFeatured;

    return this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        coverImageCaption: dto.coverImageCaption,
        status: isDirectAdminPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
        publishedAt: isDirectAdminPublish ? new Date() : null,
        authorId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        readingTime: dto.readingTime || calculatedReadingTime,
        isBreaking: userRole === Role.ADMIN ? (dto.isBreaking || false) : false,
        isFeatured: userRole === Role.ADMIN ? (dto.isFeatured || false) : false,
        seoTitle: dto.seoTitle || dto.title,
        seoDescription: dto.seoDescription || dto.excerpt,
        tags: {
          create: tagConnectOrCreate,
        },
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    // Reporter can only update their own article and only in DRAFT or REJECTED status
    if (userRole === Role.REPORTER) {
      if (article.authorId !== userId) {
        throw new ForbiddenException('অন্য প্রতিবেদকের সংবাদ সম্পাদনা করার অনুমতি নেই');
      }
      if (article.status !== ArticleStatus.DRAFT && article.status !== ArticleStatus.REJECTED) {
        throw new BadRequestException('শুধুমাত্র খসড়া বা প্রত্যাখ্যাত সংবাদ সম্পাদনা করা যাবে');
      }
    }

    const data: any = { ...dto };
    delete data.tags;

    if (dto.title && !dto.slug) {
      // Keep existing slug unless explicitly requested
    }

    if (userRole !== Role.ADMIN) {
      delete data.isBreaking;
      delete data.isFeatured;
      delete data.isTrending;
    }

    return this.prisma.article.update({
      where: { id },
      data,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async submitForReview(id: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('শুধুমাত্র নিজের সংবাদ জমা দেওয়া যাবে');
    }

    if (article.status !== ArticleStatus.DRAFT && article.status !== ArticleStatus.REJECTED) {
      throw new BadRequestException('সংবাদটি ইতিমধ্যে পর্যালোচনায় রয়েছে অথবা প্রকাশিত হয়েছে');
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.PENDING_REVIEW,
        rejectionReason: null,
      },
    });
  }

  async approve(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.APPROVED,
      },
    });
  }

  async reject(id: string, reason: string) {
    const article = await this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    // Notify author
    await this.prisma.notification.create({
      data: {
        userId: article.authorId,
        title: 'সংবাদ সংশোধন প্রয়োজন',
        message: `আপনার সংবাদ "${article.title}" প্রত্যাখ্যাত হয়েছে। কারণ: ${reason}`,
        type: 'ARTICLE_REJECTED',
        link: `/reporter/articles/${article.id}/edit`,
      },
    });

    return article;
  }

  async publish(id: string) {
    const article = await this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Notify author
    await this.prisma.notification.create({
      data: {
        userId: article.authorId,
        title: 'সংবাদ প্রকাশিত হয়েছে',
        message: `আপনার সংবাদ "${article.title}" সফলভাবে প্রকাশিত হয়েছে।`,
        type: 'ARTICLE_PUBLISHED',
        link: `/article/${article.slug}`,
      },
    });

    return article;
  }

  async unpublish(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: {
        status: ArticleStatus.DRAFT,
      },
    });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    if (userRole === Role.REPORTER) {
      if (article.authorId !== userId) {
        throw new ForbiddenException('অন্যের সংবাদ মুছে ফেলা সম্ভব নয়');
      }
      if (article.status !== ArticleStatus.DRAFT) {
        throw new BadRequestException('শুধুমাত্র খসড়া সংবাদ মুছে ফেলা যাবে');
      }
    }

    return this.prisma.article.delete({
      where: { id },
    });
  }

  async getBreaking(limit = 5) {
    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        isBreaking: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
      },
    });
  }

  async getTrending(limit = 10) {
    // Algorithmic trending formula: views * 0.5 + likes * 0.2 + recency * 0.3
    const recentArticles = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Within last 7 days
        },
      },
      include: {
        category: true,
        author: {
          select: { name: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      take: 50,
    });

    const scored = recentArticles.map((art) => {
      const hoursAgo = Math.max(1, (Date.now() - (art.publishedAt?.getTime() || Date.now())) / (1000 * 60 * 60));
      const recencyScore = 100 / Math.sqrt(hoursAgo);
      const score = art.views * 0.5 + art._count.likes * 0.2 + recencyScore * 0.3;
      return { article: art, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.article);
  }

  private async recordView(articleId: string, ipHash?: string, userId?: string) {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const existingView = await this.prisma.articleView.findFirst({
        where: {
          articleId,
          createdAt: { gte: tenMinutesAgo },
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(ipHash ? [{ ipHash }] : []),
          ],
        },
      });

      if (!existingView) {
        await this.prisma.$transaction([
          this.prisma.articleView.create({
            data: {
              articleId,
              ipHash,
              userId,
            },
          }),
          this.prisma.article.update({
            where: { id: articleId },
            data: { views: { increment: 1 } },
          }),
        ]);
      }
    } catch {
      // Non-blocking view failure
    }
  }
}
