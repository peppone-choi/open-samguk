import { Constraint, ConstraintContext, ConstraintResult, StateView } from '../Constraint.js';

/**
 * 대상 국가가 현재 국가와 달라야 함
 */
export class DifferentDestNationConstraint implements Constraint {
  name = 'DifferentDestNation';

  requires(ctx: ConstraintContext) {
    return [
      { kind: 'general' as const, id: ctx.actorId },
      { kind: 'destNation' as const, id: ctx.destNationId ?? 0 }
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: 'general', id: ctx.actorId });
    const destNation = view.get({ kind: 'destNation', id: ctx.destNationId ?? 0 });

    if (!general || !destNation) {
      return { kind: 'deny', reason: '정보를 찾을 수 없습니다.' };
    }

    if (destNation.id !== general.nationId) {
      return { kind: 'allow' };
    }

    return { kind: 'deny', reason: '같은 국가입니다.' };
  }
}
