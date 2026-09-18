import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          include: {
            category: true,
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });
  }

  async checkBookmark(userId: string, articleId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    return { bookmarked: !!bookmark };
  }

  async addBookmark(userId: string, articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    return this.prisma.bookmark.upsert({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
      update: {},
      create: {
        userId,
        articleId,
      },
    });
  }

  async removeBookmark(userId: string, articleId: string) {
    try {
      await this.prisma.bookmark.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
      return { success: true, message: 'বুকমার্ক সরানো হয়েছে' };
    } catch {
      return { success: true, message: 'বুকমার্ক ইতিমধ্যে সরানো হয়েছে' };
    }
  }
}
