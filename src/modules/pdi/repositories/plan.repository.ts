import type { PageParams, PageResult } from '@/core/types';
import type {
  ActionItem,
  CheckIn,
  Feedback,
  Goal,
  Plan,
  PlanStatus,
} from '@prisma/client';

export type CreatePlanInput = {
  userId: string;
  title: string;
  description?: string | null | undefined;
  periodFrom: Date;
  periodTo: Date;
  goals?:
    | Array<{
        title: string;
        specific?: string | null;
        measurable?: string | null;
        achievable?: string | null;
        relevant?: string | null;
        timeBound?: Date | null;
        actions?: Array<{
          description: string;
          ownerId?: string | null;
          dueDate?: Date | null;
        }>;
      }>
    | undefined;
};

type GoalInput = NonNullable<CreatePlanInput['goals']>[number];
type ActionInput = NonNullable<GoalInput['actions']>[number];

export interface IPlanRepository {
  createPlanWithGoals(input: CreatePlanInput): Promise<Plan>;

  getPlan(id: string): Promise<
    | (Plan & {
        goals: (Goal & { actions: ActionItem[]; checkIns: CheckIn[] })[];
      })
    | null
  >;

  listByUser(userId: string, params?: PageParams): Promise<PageResult<Plan>>;

  setStatus(id: string, status: PlanStatus): Promise<void>;

  addGoal(
    planId: string,
    goal: Omit<GoalInput, 'actions'> & { actions?: ActionInput[] }
  ): Promise<Goal>;

  addAction(goalId: string, action: ActionInput): Promise<ActionItem>;

  addCheckIn(
    goalId: string,
    data: { notes?: string | null; progressPct: number }
  ): Promise<CheckIn>;

  addFeedback(
    planId: string,
    authorId: string,
    message: string
  ): Promise<Feedback>;
}
