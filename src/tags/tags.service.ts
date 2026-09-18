import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async findPopular(limit = 10) {
    return this.prisma.tag.findMany({
      take: limit,
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        articles: {
          _count: 'desc',
        },
      },
    });
  }

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.tag.create({
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
