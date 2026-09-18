import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, category?: string, tag?: string, page = 1, limit = 12) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const trimmed = (query || '').trim();

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (trimmed) {
      where.OR = [
        { title: { contains: trimmed, mode: 'insensitive' } },
        { excerpt: { contains: trimmed, mode: 'insensitive' } },
        { content: { contains: trimmed, mode: 'insensitive' } },
        { author: { name: { contains: trimmed, mode: 'insensitive' } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: true,
          author: { select: { id: true, name: true, image: true } },
          tags: { include: { tag: true } },
        },
      }),
    ]);

    return {
      query: trimmed,
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
