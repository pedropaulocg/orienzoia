import { TokenService } from '@/helpers/TokenService';
import { PrismaUserRepository } from '@/modules/users/repositories/prisma-user.repository';
import { Router } from 'express';
import { PrismaRefreshTokenRepository } from '../repositories/prisma-refresh-token.repository';
import { AuthService } from '../services/auth.service';

const router = Router();
const userRepo = new PrismaUserRepository();
const refreshTokenRepo = new PrismaRefreshTokenRepository();
const authService = new AuthService(
  userRepo,
  refreshTokenRepo,
  process.env.JWT_SECRET!
);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  const tokens = await authService.login({ email, password });
  res.json(tokens);
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token é obrigatório' });
  }

  const tokens = await authService.refreshAccessToken({ refreshToken });
  res.json(tokens);
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token é obrigatório' });
  }

  await authService.logout(refreshToken);
  res.status(204).send();
});

// Endpoint para fazer logout de todos os dispositivos (precisa de auth)
router.post('/logout-all', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const tokenService = new TokenService(process.env.JWT_SECRET!);
    const payload = tokenService.verifyAccessToken(token);
    await authService.logoutAll(payload.sub);
    res.status(204).send();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

export default router;
