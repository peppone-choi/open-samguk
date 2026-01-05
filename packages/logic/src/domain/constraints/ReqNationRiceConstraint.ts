import { Constraint, ConstraintContext, ConstraintResult, StateView } from '../Constraint.js';

/**
 * 국가 군량이 충분해야 함
 */
export class ReqNationRiceConstraint implements Constraint {
  name = 'ReqNationRice';

  constructor(private amount: number) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: 'nation' as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: 'nation', id: ctx.nationId ?? 0 });

    if (!nation) {
      return { kind: 'deny', reason: '국가 정보를 찾을 수 없습니다.' };
    }

    if (nation.rice >= this.amount) {
      return { kind: 'allow' };
    }

    return { kind: 'deny', reason: '병량이 부족합니다.' };
  }
}
