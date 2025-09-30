import type { RefreshToken } from '@prisma/client';

export type CreateRefreshTokenInput = {
  token: string;
  userId: string;
  expiresAt: Date;
};

export type RefreshTokenWithUser = RefreshToken & {
  user: {
    id: string;
    isActive: boolean;
    role: string;
  };
};

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenInput): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshTokenWithUser | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
