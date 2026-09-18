import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await this.prisma.newsletterSubscription.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        return this.prisma.newsletterSubscription.update({
          where: { email: cleanEmail },
          data: { isActive: true },
        });
      }
      return { success: true, message: 'আপনি ইতিমধ্যে নিউজলেটারে সাবস্ক্রাইব করেছেন' };
    }

    return this.prisma.newsletterSubscription.create({
      data: { email: cleanEmail },
    });
  }

  async getAllSubscribers() {
    return this.prisma.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
