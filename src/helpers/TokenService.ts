import type { TokenPayload } from '@/modules/auth/types';
import { randomBytes } from 'crypto';
import { sign, SignOptions, verify } from 'jsonwebtoken';

export class TokenService {
  constructor(private readonly secret: string) {}

  generateAccessToken(userId: string, role: string): string {
    const payload: TokenPayload = {
      sub: userId,
      role,
    };

    const options: SignOptions = { expiresIn: '15m' };
    return sign(payload, this.secret, options);
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  verifyAccessToken(token: string): TokenPayload {
    return verify(token, this.secret) as TokenPayload;
  }
}
