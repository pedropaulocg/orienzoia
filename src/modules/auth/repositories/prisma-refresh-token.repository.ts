import { prisma } from '@/infra/prisma';
import type {
  CreateRefreshTokenInput,
  IRefreshTokenRepository,
} from './refresh-token.repository';

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async create(data: CreateRefreshTokenInput) {
    return prisma.refreshToken.create({ data });
  }

  async findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            role: true,
          },
        },
      },
    });
  }

  async deleteByToken(token: string) {
    await prisma.refreshToken.delete({ where: { token } });
  }

  async deleteByUserId(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async deleteExpired() {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
