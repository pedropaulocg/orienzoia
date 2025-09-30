import { prisma } from '@/infra/prisma';
import type { AuthRequest } from '@/middlewares/AuthMiddleware';
import type { NextFunction, Response } from 'express';

export class PDIAuthorizationMiddleware {
  static requirePlanAccess = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const planId = req.params.id || req.params.planId;
    const { user } = req;

    if (!planId) {
      return res.status(400).json({ message: 'ID do plano é obrigatório' });
    }

    if (user.role === 'ADMIN') {
      return next();
    }

    try {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          user: {
            select: {
              managerId: true,
            },
          },
        },
      });

      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado' });
      }

      if (user.role === 'USER') {
        if (plan.userId === user.id) {
          return next();
        }
        return res.status(403).json({
          message: 'Acesso negado: você só pode acessar seus próprios planos',
        });
      }

      if (user.role === 'MANAGER') {
        if (plan.userId === user.id || plan.user.managerId === user.id) {
          return next();
        }
        return res.status(403).json({
          message:
            'Acesso negado: você só pode acessar planos próprios ou de sua equipe',
        });
      }

      return res.status(403).json({ message: 'Acesso negado' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };

  static requirePlanCreationAccess = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { userId } = req.body;
    const { user } = req;

    if (!userId) {
      req.body.userId = user.id;
      return next();
    }

    if (user.role === 'ADMIN') {
      return next();
    }

    if (user.role === 'USER') {
      if (userId === user.id) {
        return next();
      }
      return res
        .status(403)
        .json({ message: 'Você só pode criar planos para si mesmo' });
    }

    if (user.role === 'MANAGER') {
      try {
        const targetUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { managerId: true },
        });

        if (!targetUser) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        if (userId === user.id || targetUser.managerId === user.id) {
          return next();
        }

        return res.status(403).json({
          message:
            'Você só pode criar planos para si mesmo ou membros de sua equipe',
        });
      } catch (error) {
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }

    return res.status(403).json({ message: 'Acesso negado' });
  };

  static requireUserAccess = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { user } = req;

    if (user.role === 'ADMIN') {
      return next();
    }

    if (user.role === 'MANAGER') {
      req.query.managerId = user.id;
      return next();
    }

    if (user.role === 'USER') {
      return res
        .status(403)
        .json({ message: 'Usuários não podem listar outros usuários' });
    }

    return res.status(403).json({ message: 'Acesso negado' });
  };

  static requireFeedbackAccess = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { planId } = req.body;
    const { user } = req;

    if (!planId) {
      return res.status(400).json({ message: 'ID do plano é obrigatório' });
    }

    if (user.role === 'ADMIN') {
      return next();
    }

    try {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        select: {
          userId: true,
          user: {
            select: { managerId: true },
          },
        },
      });

      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado' });
      }

      if (user.role === 'MANAGER' && plan.user.managerId === user.id) {
        return next();
      }

      if (plan.userId === user.id) {
        return next();
      }

      return res.status(403).json({
        message:
          'Você só pode dar feedback em planos próprios ou de sua equipe',
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
}
