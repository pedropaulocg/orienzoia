// src/middlewares/AuthMiddleware.ts
import type { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export class AuthMiddleware {
  constructor(private readonly secret: string) {}

  handle = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    try {
      const payload = verify(token, this.secret) as any;
      req.user = { id: payload.sub, role: payload.role };
      return next();
    } catch {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  };

  static onlyRoles(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    };
  }
}
