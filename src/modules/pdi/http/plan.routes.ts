import { Router } from 'express';
import { PrismaPlanRepository } from '../repositories/prisma-plan.repository';
import { PlanService } from '../services/plan.service';

const repo = new PrismaPlanRepository();
const service = new PlanService(repo);
const router = Router();

router.post('/', async (req, res) => {
  const created = await service.createDraftPlan(req.body);
  res.status(201).json(created);
});

router.get('/:id', async (req, res) => {
  const plan = await repo.getPlan(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});

export default router;
