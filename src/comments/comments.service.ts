import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, ReportCommentDto } from './dto/comment.dto';
import { Role, CommentStatus } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByArticle(articleId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        articleId,
        status: CommentStatus.APPROVED,
        parentId: null, // Top-level comments
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
        replies: {
          where: { status: CommentStatus.APPROVED },
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true, image: true, role: true },
            },
          },
        },
      },
    });

    return comments;
  }

  async create(userId: string, dto: CreateCommentDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
    });
    if (!article) {
      throw new NotFoundException('সংবাদটি পাওয়া যায়নি');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('মূল মন্তব্যটি পাওয়া যায়নি');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        articleId: dto.articleId,
        userId,
        parentId: dto.parentId,
        status: CommentStatus.APPROVED,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('মন্তব্যটি পাওয়া যায়নি');
    }

    if (userRole !== Role.ADMIN && comment.userId !== userId) {
      throw new ForbiddenException('অন্যের মন্তব্য মুছে ফেলার অনুমতি নেই');
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }

  async report(commentId: string, userId: string, dto: ReportCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('মন্তব্যটি পাওয়া যায়নি');
    }

    return this.prisma.report.create({
      data: {
        commentId,
        userId,
        reason: dto.reason,
      },
    });
  }

  async findAllFlagged() {
    return this.prisma.comment.findMany({
      where: {
        reports: { some: {} },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        article: { select: { id: true, title: true, slug: true } },
        reports: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async moderate(id: string, status: CommentStatus) {
    return this.prisma.comment.update({
      where: { id },
      data: { status },
    });
  }
}
