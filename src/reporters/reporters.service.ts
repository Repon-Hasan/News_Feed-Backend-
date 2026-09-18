import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReporterProfileDto } from './dto/reporter.dto';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class ReportersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['REPORTER', 'ADMIN'] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        reporterProfile: true,
        _count: {
          select: {
            articles: {
              where: { status: ArticleStatus.PUBLISHED },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    const reporter = await this.prisma.user.findFirst({
      where: {
        id,
        role: { in: ['REPORTER', 'ADMIN'] },
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        reporterProfile: true,
        articles: {
          where: { status: ArticleStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          include: { category: true },
        },
      },
    });

    if (!reporter) {
      throw new NotFoundException('প্রতিবেদক পাওয়া যায়নি');
    }

    return reporter;
  }

  async getReporterArticles(userId: string, status?: ArticleStatus) {
    const where: any = { authorId: userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        subcategory: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });
  }

  async getReporterAnalytics(userId: string) {
    const [totalArticles, drafts, pending, published, rejected, viewsAggregate] =
      await Promise.all([
        this.prisma.article.count({ where: { authorId: userId } }),
        this.prisma.article.count({
          where: { authorId: userId, status: ArticleStatus.DRAFT },
        }),
        this.prisma.article.count({
          where: { authorId: userId, status: ArticleStatus.PENDING_REVIEW },
        }),
        this.prisma.article.count({
          where: { authorId: userId, status: ArticleStatus.PUBLISHED },
        }),
        this.prisma.article.count({
          where: { authorId: userId, status: ArticleStatus.REJECTED },
        }),
        this.prisma.article.aggregate({
          where: { authorId: userId },
          _sum: { views: true },
        }),
      ]);

    return {
      totalArticles,
      drafts,
      pending,
      published,
      rejected,
      totalViews: viewsAggregate._sum.views || 0,
    };
  }

  async updateProfile(userId: string, dto: UpdateReporterProfileDto) {
    return this.prisma.reporterProfile.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }
}
