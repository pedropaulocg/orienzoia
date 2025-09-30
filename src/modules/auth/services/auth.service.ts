import { AppError } from '@/helpers/AppError';
import { Crypto } from '@/helpers/Crypt';
import { TokenService } from '@/helpers/TokenService';
import type { IUserRepository } from '@/modules/users/repositories/user.repository';
import type { IRefreshTokenRepository } from '../repositories/refresh-token.repository';
import type { AuthTokens, LoginInput, RefreshTokenInput } from '../types';

export class AuthService {
  private readonly tokenService: TokenService;

  constructor(
    private readonly users: IUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
    jwtSecret: string
  ) {
    this.tokenService = new TokenService(jwtSecret);
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    // Buscar usuário por email
    const user = await this.users.findByEmailCI(input.email);
    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar se está ativo
    if (!user.isActive) {
      throw new AppError('Usuário inativo', 403);
    }

    // Verificar senha
    const isValidPassword = await Crypto.comparePassword(
      input.password,
      user.password
    );
    if (!isValidPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Revogar tokens existentes do usuário
    await this.refreshTokens.deleteByUserId(user.id);

    // Gerar novos tokens
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.role
    );
    const refreshToken = this.tokenService.generateRefreshToken();

    // Salvar refresh token (7 dias de expiração)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokens.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(input: RefreshTokenInput): Promise<AuthTokens> {
    // Buscar refresh token
    const tokenRecord = await this.refreshTokens.findByToken(
      input.refreshToken
    );
    if (!tokenRecord) {
      throw new AppError('Refresh token inválido', 401);
    }

    // Verificar se não expirou
    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokens.deleteByToken(input.refreshToken);
      throw new AppError('Refresh token expirado', 401);
    }

    // Verificar se usuário ainda está ativo
    if (!tokenRecord.user.isActive) {
      await this.refreshTokens.deleteByUserId(tokenRecord.userId);
      throw new AppError('Usuário inativo', 403);
    }

    // Revogar token atual (rotação)
    await this.refreshTokens.deleteByToken(input.refreshToken);

    // Gerar novos tokens
    const accessToken = this.tokenService.generateAccessToken(
      tokenRecord.user.id,
      tokenRecord.user.role
    );
    const newRefreshToken = this.tokenService.generateRefreshToken();

    // Salvar novo refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokens.create({
      token: newRefreshToken,
      userId: tokenRecord.user.id,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokens.deleteByToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokens.deleteByUserId(userId);
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokens.deleteExpired();
  }
}
