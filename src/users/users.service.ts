import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRoleDto, UpdateUserStatusDto, UpdateProfileDto } from './dto/user.dto';
import { Role, ArticleStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers(search?: string, role?: Role, page = 1, limit = 20) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, Math.min(100, limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isActive: true,
          createdAt: true,
          reporterProfile: true,
          _count: {
            select: { articles: true, comments: true },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async updateUserRole(
    targetUserId: string,
    currentAdminId: string,
    dto: UpdateUserRoleDto,
  ) {
    if (targetUserId === currentAdminId && dto.role !== Role.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('আপনি একমাত্র সক্রিয় অ্যাডমিন, নিজের ভূমিকা পরিবর্তন করতে পারবেন না');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('ব্যবহারকারী পাওয়া যায়নি');
    }

    // Update role
    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true },
    });

    // If promoted to REPORTER, ensure reporter profile exists
    if (dto.role === Role.REPORTER || dto.role === Role.ADMIN) {
      await this.prisma.reporterProfile.upsert({
        where: { userId: targetUserId },
        update: {
          designation: dto.designation || 'সংবাদকর্মী',
          isVerified: true,
        },
        create: {
          userId: targetUserId,
          designation: dto.designation || 'সংবাদকর্মী',
          isVerified: true,
        },
      });
    }

    return updated;
  }

  async updateUserStatus(targetUserId: string, currentAdminId: string, dto: UpdateUserStatusDto) {
    if (targetUserId === currentAdminId && !dto.isActive) {
      throw new BadRequestException('নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা সম্ভব নয়');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: dto.isActive },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, email: true, image: true, role: true },
    });
  }

  async getAdminAnalytics() {
    const [
      totalUsers,
      totalReporters,
      totalArticles,
      publishedArticles,
      pendingArticles,
      viewsSum,
      categories,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.REPORTER } }),
      this.prisma.article.count(),
      this.prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      this.prisma.article.count({ where: { status: ArticleStatus.PENDING_REVIEW } }),
      this.prisma.article.aggregate({ _sum: { views: true } }),
      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { articles: true },
          },
        },
      }),
    ]);

    // Recent 7 days article publication count
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentArticles = await this.prisma.article.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, status: true },
    });

    return {
      totalUsers,
      totalReporters,
      totalArticles,
      publishedArticles,
      pendingArticles,
      totalViews: viewsSum._sum.views || 0,
      categories: categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        count: c._count.articles,
      })),
      recentArticlesCount: recentArticles.length,
    };
  }

  async getAdminArticles(status?: ArticleStatus, page = 1, limit = 20) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, Math.min(100, limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
