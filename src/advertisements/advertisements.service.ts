import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdPlacement } from '@prisma/client';

export interface CreateAdDto {
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AdvertisementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByPlacement(placement?: AdPlacement) {
    return this.prisma.advertisement.findMany({
      where: {
        isActive: true,
        ...(placement ? { placement } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateAdDto) {
    return this.prisma.advertisement.create({
      data,
    });
  }

  async recordClick(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { isActive },
    });
  }

  async delete(id: string) {
    return this.prisma.advertisement.delete({
      where: { id },
    });
  }
}
