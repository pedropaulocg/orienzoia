import type { PageParams, PageResult } from '@/core/types';
import { prisma } from '@/infra/prisma';
import { $Enums, Prisma } from '@prisma/client';
import type { CreatePlanInput, IPlanRepository } from './plan.repository';

export class PrismaPlanRepository implements IPlanRepository {
  async createPlanWithGoals(input: CreatePlanInput) {
    return prisma.$transaction(async (tx) => {
      const goalsData: Prisma.GoalCreateWithoutPlanInput[] = (
        input.goals ?? []
      ).map((g) => ({
        title: g.title,
        specific: g.specific ?? null,
        measurable: g.measurable ?? null,
        achievable: g.achievable ?? null,
        relevant: g.relevant ?? null,
        timeBound: g.timeBound ?? null,
        ...(g.actions?.length
          ? {
              actions: {
                create: g.actions.map((a) => ({
                  description: a.description,
                  ownerId: a.ownerId ?? null,
                  dueDate: a.dueDate ?? null,
                })),
              },
            }
          : {}),
      }));

      const plan = await tx.plan.create({
        data: {
          user: { connect: { id: input.userId } },
          title: input.title,
          ...(input.description != null
            ? { description: input.description }
            : {}),
          periodFrom: input.periodFrom,
          periodTo: input.periodTo,
          status: $Enums.PlanStatus.DRAFT,
          ...(goalsData.length ? { goals: { create: goalsData } } : {}),
        },
      });

      return plan;
    });
  }

  async getPlan(id: string) {
    return prisma.plan.findUnique({
      where: { id },
      include: {
        goals: {
          include: {
            actions: true,
            checkIns: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async listByUser(userId: string, params?: PageParams) {
    const { skip, take, page, pageSize } = toPage(params ?? {});
    const [total, data] = await prisma.$transaction([
      prisma.plan.count({ where: { userId } }),
      prisma.plan.findMany({
        where: { userId },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
    ]);
    return { data, page, pageSize, total } as PageResult<(typeof data)[number]>;
  }

  async setStatus(id: string, status: $Enums.PlanStatus) {
    await prisma.plan.update({ where: { id }, data: { status } });
  }

  async addGoal(
    planId: string,
    goal: NonNullable<CreatePlanInput['goals']>[number]
  ) {
    return prisma.goal.create({
      data: {
        planId,
        title: goal.title,
        specific: goal.specific ?? null,
        measurable: goal.measurable ?? null,
        achievable: goal.achievable ?? null,
        relevant: goal.relevant ?? null,
        timeBound: goal.timeBound ?? null,
        ...(goal.actions?.length
          ? {
              actions: {
                create: goal.actions.map((a) => ({
                  description: a.description,
                  ownerId: a.ownerId ?? null,
                  dueDate: a.dueDate ?? null,
                })),
              },
            }
          : {}),
      },
    });
  }

  async addAction(
    goalId: string,
    action: {
      description: string;
      ownerId?: string | null;
      dueDate?: Date | null;
    }
  ) {
    return prisma.actionItem.create({
      data: {
        goalId,
        description: action.description,
        ownerId: action.ownerId ?? null,
        dueDate: action.dueDate ?? null,
      },
    });
  }

  async addCheckIn(
    goalId: string,
    data: { notes?: string | null; progressPct: number }
  ) {
    return prisma.checkIn.create({
      data: {
        goalId,
        notes: data.notes ?? null,
        progressPct: data.progressPct,
      },
    });
  }

  async addFeedback(planId: string, authorId: string, message: string) {
    return prisma.feedback.create({
      data: { planId, authorId, message },
    });
  }
}

function toPage({ page = 1, pageSize = 20 }: PageParams) {
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}
