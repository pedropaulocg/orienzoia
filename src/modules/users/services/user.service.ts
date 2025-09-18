import { Crypto } from '@/helpers/Crypt';
import type { IUserRepository } from '../repositories/user.repository';

export class UserService {
  constructor(private readonly users: IUserRepository) {}

  async create(input: {
    name: string;
    email: string;
    password: string;
    role?: 'USER' | 'MANAGER' | 'ADMIN';
  }) {
    const passwordHash = await Crypto.hashPassword(input.password);

    return this.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
  }

  async activate(id: string) {
    await this.users.setActive(id, true);
  }
  async deactivate(id: string) {
    await this.users.setActive(id, false);
  }
}
