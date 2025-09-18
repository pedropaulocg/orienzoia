import type { PageParams, PageResult } from '@/core/types';
import type { User, UserRole } from '@prisma/client';
import { UserPublic } from '../types';

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole | undefined;
};

export interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmailCI(email: string): Promise<User | null>;
  list(params?: PageParams): Promise<PageResult<UserPublic>>;
  setActive(id: string, isActive: boolean): Promise<void>;
}
