import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ArticleStatus } from '@prisma/client';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prisma: Partial<PrismaService>;

  beforeEach(() => {
    prisma = {
      article: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      } as any,
      notification: {
        create: jest.fn(),
      } as any,
    };

    service = new ArticlesService(prisma as PrismaService);
  });

  it('should create article draft for reporter with DRAFT status', async () => {
    const mockCreated = {
      id: 'art-1',
      title: 'টেস্ট সংবাদ শিরোনাম',
      slug: 'test-news-title-12345',
      status: ArticleStatus.DRAFT,
      authorId: 'reporter-1',
    };

    (prisma.article.create as jest.Mock).mockResolvedValue(mockCreated);

    const result = await service.create(
      'reporter-1',
      {
        title: 'টেস্ট সংবাদ শিরোনাম',
        excerpt: 'টেস্ট বিবরণ',
        content: '<p>টেস্ট বিস্তারিত...</p>',
        categoryId: 'cat-1',
      },
      Role.REPORTER,
    );

    expect(result.status).toBe(ArticleStatus.DRAFT);
    expect(prisma.article.create).toHaveBeenCalled();
  });

  it('should allow reporter to submit own draft for review', async () => {
    (prisma.article.findUnique as jest.Mock).mockResolvedValue({
      id: 'art-1',
      authorId: 'reporter-1',
      status: ArticleStatus.DRAFT,
    });

    (prisma.article.update as jest.Mock).mockResolvedValue({
      id: 'art-1',
      status: ArticleStatus.PENDING_REVIEW,
    });

    const result = await service.submitForReview('art-1', 'reporter-1');
    expect(result.status).toBe(ArticleStatus.PENDING_REVIEW);
  });

  it('should prevent reporter from submitting another reporter article', async () => {
    (prisma.article.findUnique as jest.Mock).mockResolvedValue({
      id: 'art-1',
      authorId: 'reporter-2',
      status: ArticleStatus.DRAFT,
    });

    await expect(service.submitForReview('art-1', 'reporter-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow admin to approve article', async () => {
    (prisma.article.update as jest.Mock).mockResolvedValue({
      id: 'art-1',
      status: ArticleStatus.APPROVED,
    });

    const result = await service.approve('art-1');
    expect(result.status).toBe(ArticleStatus.APPROVED);
  });

  it('should allow admin to reject article with reason and create notification', async () => {
    (prisma.article.update as jest.Mock).mockResolvedValue({
      id: 'art-1',
      title: 'টেস্ট সংবাদ',
      authorId: 'reporter-1',
      status: ArticleStatus.REJECTED,
      rejectionReason: 'তথ্য স্পষ্ট নয়',
    });

    const result = await service.reject('art-1', 'তথ্য স্পষ্ট নয়');
    expect(result.status).toBe(ArticleStatus.REJECTED);
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'reporter-1',
        type: 'ARTICLE_REJECTED',
      }),
    });
  });

  it('should allow admin to publish article', async () => {
    (prisma.article.update as jest.Mock).mockResolvedValue({
      id: 'art-1',
      title: 'টেস্ট সংবাদ',
      authorId: 'reporter-1',
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    const result = await service.publish('art-1');
    expect(result.status).toBe(ArticleStatus.PUBLISHED);
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'reporter-1',
        type: 'ARTICLE_PUBLISHED',
      }),
    });
  });
});
