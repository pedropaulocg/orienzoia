import type {
  CreatePlanInput,
  IPlanRepository,
} from '../repositories/plan.repository';

export class PlanService {
  constructor(private readonly plans: IPlanRepository) {}

  async createDraftPlan(input: CreatePlanInput) {
    if (input.periodTo <= input.periodFrom) {
      const err = new Error('periodTo must be after periodFrom');
      (err as any).status = 400;
      throw err;
    }

    return this.plans.createPlanWithGoals(input);
  }

  async activatePlan(id: string) {
    return this.plans.setStatus(id, 'ACTIVE');
  }
}
