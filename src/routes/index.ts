import authRoutes from '@/modules/auth/http/auth.routes';
import planRoutes from '@/modules/pdi/http/plan.routes';
import usersRoutes from '@/modules/users/http/user.routes';
import { Router } from 'express';

const router = Router();

router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/users', usersRoutes);

export default router;
