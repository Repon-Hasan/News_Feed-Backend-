import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: Partial<PrismaService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      } as any,
      reporterProfile: {
        upsert: jest.fn(),
      } as any,
    };

    service = new UsersService(prisma as PrismaService);
  });

  it('should prevent the last admin from demoting themselves', async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(1); // Only 1 admin exists

    await expect(
      service.updateUserRole('admin-1', 'admin-1', { role: Role.USER }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should promote USER to REPORTER and create reporterProfile', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      role: Role.USER,
    });

    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: 'user-1',
      role: Role.REPORTER,
      name: 'টেস্ট রিপোর্টার',
    });

    const result = await service.updateUserRole('user-1', 'admin-1', {
      role: Role.REPORTER,
      designation: 'জ্যেষ্ঠ প্রতিবেদক',
    });

    expect(result.role).toBe(Role.REPORTER);
    expect(prisma.reporterProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      }),
    );
  });
});
