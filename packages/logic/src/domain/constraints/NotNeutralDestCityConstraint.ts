import { Constraint, ConstraintContext, ConstraintResult, StateView } from '../Constraint.js';

/**
 * 대상 도시가 공백지가 아니어야 함 (destCity.nationId != 0)
 */
export class NotNeutralDestCityConstraint implements Constraint {
  name = 'NotNeutralDestCity';

  requires(ctx: ConstraintContext) {
    return [{ kind: 'destCity' as const, id: ctx.destCityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const destCity = view.get({ kind: 'destCity', id: ctx.destCityId ?? 0 });

    if (!destCity) {
      return { kind: 'deny', reason: '대상 도시 정보를 찾을 수 없습니다.' };
    }

    if (destCity.nationId !== 0) {
      return { kind: 'allow' };
    }

    return { kind: 'deny', reason: '공백지입니다.' };
  }
}
