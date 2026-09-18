import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async checkLike(userId: string, articleId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    return { liked: !!like };
  }

  async addLike(userId: string, articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    await this.prisma.like.upsert({
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

    const count = await this.prisma.like.count({ where: { articleId } });
    return { liked: true, totalLikes: count };
  }

  async removeLike(userId: string, articleId: string) {
    try {
      await this.prisma.like.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
    } catch {
      // Ignored if not found
    }

    const count = await this.prisma.like.count({ where: { articleId } });
    return { liked: false, totalLikes: count };
  }
}
