import type { PageParams, PageResult } from '@/core/types';
import { prisma } from '@/infra/prisma';
import type { CreateUserInput, IUserRepository } from './user.repository';

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class PrismaUserRepository implements IUserRepository {
  async create(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        role: data.role ?? 'USER',
      },
      select: userSafeSelect,
    }) as any;
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSafeSelect,
    }) as any;
  }

  async findByEmailCI(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userSafeSelect,
    }) as any;
  }

  async list(params?: PageParams) {
    const { skip, take, page, pageSize } = toPage(params ?? {});
    const [total, data] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({
        select: userSafeSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return { data, page, pageSize, total } satisfies PageResult<any>;
  }

  async setActive(id: string, isActive: boolean) {
    await prisma.user.update({ where: { id }, data: { isActive } });
  }
}

function toPage({ page = 1, pageSize = 20 }: PageParams) {
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}
