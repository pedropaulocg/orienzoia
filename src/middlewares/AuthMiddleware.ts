import { TokenService } from '@/helpers/TokenService';
import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

export class AuthMiddleware {
  private readonly tokenService: TokenService;

  constructor(jwtSecret: string) {
    this.tokenService = new TokenService(jwtSecret);
  }

  requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
      const payload = this.tokenService.verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role as UserRole };
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  };

  requireRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      if (!roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: 'Acesso negado para este nível de usuário' });
      }

      next();
    };
  };

  requireOwnershipOrRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const resourceUserId = req.params.userId || req.body.userId;

      if (req.user.id === resourceUserId || roles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({ message: 'Acesso negado ao recurso' });
    };
  };

  handle = this.requireAuth;

  static onlyRoles(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    };
  }
}
