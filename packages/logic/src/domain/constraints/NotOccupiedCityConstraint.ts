import { Constraint, ConstraintContext, ConstraintResult, StateView } from '../Constraint.js';

/**
 * 아국이 아니어야 함 (현재 도시가 본인의 국가와 다름)
 */
export class NotOccupiedCityConstraint implements Constraint {
  name = 'NotOccupiedCity';

  requires(ctx: ConstraintContext) {
    return [
      { kind: 'general' as const, id: ctx.actorId },
      { kind: 'city' as const, id: ctx.cityId ?? 0 }
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: 'general', id: ctx.actorId });
    const city = view.get({ kind: 'city', id: ctx.cityId ?? 0 });

    if (!general || !city) {
      return { kind: 'deny', reason: '정보를 찾을 수 없습니다.' };
    }

    if (city.nationId !== general.nationId) {
      return { kind: 'allow' };
    }

    return { kind: 'deny', reason: '아국입니다.' };
  }
}
