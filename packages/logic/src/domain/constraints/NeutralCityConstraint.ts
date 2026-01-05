import { Constraint, ConstraintContext, ConstraintResult, StateView } from '../Constraint.js';

/**
 * 공백지여야 함 (도시의 nationId가 0)
 */
export class NeutralCityConstraint implements Constraint {
  name = 'NeutralCity';

  requires(ctx: ConstraintContext) {
    return [{ kind: 'city' as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: 'deny', reason: '도시 정보를 찾을 수 없습니다.' };
    }

    if (city.nationId === 0) {
      return { kind: 'allow' };
    }

    return { kind: 'deny', reason: '공백지가 아닙니다.' };
  }
}
