import { Crypto } from '@/helpers/Crypt';
import type { IUserRepository } from '../repositories/user.repository';
import { TokenService } from '@/helpers/TokenService';
import { AppError } from '@/helpers/AppError';


export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokens: TokenService
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmailCI(email);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const valid = await Crypto.comparePassword(password, user.password);
    if (!valid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = this.tokens.generate({ sub: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}
