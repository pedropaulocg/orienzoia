import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { PDIAuthorizationMiddleware } from '@/middlewares/PDIAuthorizationMiddleware';
import { Router } from 'express';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { UserService } from '../services/user.service';

const router = Router();
const repo = new PrismaUserRepository();
const service = new UserService(repo);
const auth = new AuthMiddleware(process.env.JWT_SECRET!);

// Criação de usuário (público)
router.post('/', async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json(created);
});

// Listar usuários (apenas MANAGER vê subordinados, ADMIN vê todos)
router.get(
  '/',
  auth.requireAuth,
  PDIAuthorizationMiddleware.requireUserAccess,
  async (req, res) => {
    const { page, pageSize, managerId } = req.query as any;
    const result = await repo.list({ page, pageSize });
    res.json(result);
  }
);

// Buscar usuário específico
router.get(
  '/:id',
  auth.requireAuth,
  auth.requireOwnershipOrRole('MANAGER', 'ADMIN'),
  async (req, res) => {
    const user = await repo.findById(req.params.id!);
    if (!user)
      return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  }
);

// Ativar usuário (apenas ADMIN)
router.patch(
  '/:id/activate',
  auth.requireAuth,
  auth.requireRole('ADMIN'),
  async (req, res) => {
    await repo.setActive(req.params.id!, true);
    res.status(204).send();
  }
);

// Desativar usuário (apenas ADMIN)
router.patch(
  '/:id/deactivate',
  auth.requireAuth,
  auth.requireRole('ADMIN'),
  async (req, res) => {
    await repo.setActive(req.params.id!, false);
    res.status(204).send();
  }
);

export default router;
