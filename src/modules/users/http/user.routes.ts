import { Router } from 'express';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { UserService } from '../services/user.service';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';

const router = Router();
const repo = new PrismaUserRepository();
const service = new UserService(repo);
const auth = new AuthMiddleware(process.env.JWT_SECRET!);

router.post('/', async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json(created);
});

router.get('/', auth.handle, async (req, res) => {
  const { page, pageSize } = req.query as any;
  const result = await repo.list({ page, pageSize });
  res.json(result);
});

router.get('/:id', auth.handle,async (req, res) => {
  const user = await repo.findById(req.params.id!);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.patch('/:id/activate', auth.handle, async (req, res) => {
  await repo.setActive(req.params.id!, true);
  res.status(204).send();
});

router.patch('/:id/deactivate', auth.handle, async (req, res) => {
  await repo.setActive(req.params.id!, false);
  res.status(204).send();
});

export default router;
