import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { PDIAuthorizationMiddleware } from '@/middlewares/PDIAuthorizationMiddleware';
import { Router } from 'express';
import { PrismaPlanRepository } from '../repositories/prisma-plan.repository';
import { PlanService } from '../services/plan.service';

const repo = new PrismaPlanRepository();
const service = new PlanService(repo);
const router = Router();
const auth = new AuthMiddleware(process.env.JWT_SECRET!);

// Criar plano (com validação de permissão para criar para outros)
router.post(
  '/',
  auth.requireAuth,
  PDIAuthorizationMiddleware.requirePlanCreationAccess,
  async (req, res) => {
    const created = await service.createDraftPlan(req.body);
    res.status(201).json(created);
  }
);

// Buscar plano específico (com validação de acesso)
router.get(
  '/:id',
  auth.requireAuth,
  PDIAuthorizationMiddleware.requirePlanAccess,
  async (req, res) => {
    const plan = await repo.getPlan(req.params.id!);
    if (!plan) return res.status(404).json({ message: 'Plano não encontrado' });
    res.json(plan);
  }
);

// Atualizar status do plano
router.patch(
  '/:id/activate',
  auth.requireAuth,
  PDIAuthorizationMiddleware.requirePlanAccess,
  async (req, res) => {
    // TODO: Implementar ativação de plano
    res.status(501).json({ message: 'Não implementado' });
  }
);

// Adicionar feedback ao plano
router.post(
  '/:id/feedback',
  auth.requireAuth,
  PDIAuthorizationMiddleware.requireFeedbackAccess,
  async (req, res) => {
    // TODO: Implementar adição de feedback
    res.status(501).json({ message: 'Não implementado' });
  }
);

export default router;
