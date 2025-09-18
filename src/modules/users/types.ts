import type { Prisma } from '@prisma/client';

export const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof userSafeSelect;
}>;
