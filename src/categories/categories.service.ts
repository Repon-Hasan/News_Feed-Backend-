import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateSubcategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        subcategories: {
          where: includeInactive ? {} : { isActive: true },
        },
        _count: {
          select: { articles: { where: { status: 'PUBLISHED' } } },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: { where: { isActive: true } },
        _count: {
          select: { articles: { where: { status: 'PUBLISHED' } } },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`বিভাগ পাওয়া যায়নি (Category '${slug}' not found)`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('এই স্ল্যাগ দিয়ে ইতিমধ্যে একটি বিভাগ বিদ্যমান');
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  async createSubcategory(dto: CreateSubcategoryDto) {
    const existing = await this.prisma.subcategory.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('এই স্ল্যাগ দিয়ে ইতিমধ্যে একটি উপ-বিভাগ বিদ্যমান');
    }

    return this.prisma.subcategory.create({
      data: dto,
    });
  }

  async deleteSubcategory(id: string) {
    return this.prisma.subcategory.delete({
      where: { id },
    });
  }
}
