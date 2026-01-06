import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

/**
 * 대상 도시가 아국이 아니어야 함
 */
export class NotOccupiedDestCityConstraint implements Constraint {
  name = "NotOccupiedDestCity";

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "destCity" as const, id: ctx.destCityId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    const destCity = view.get({ kind: "destCity", id: ctx.destCityId ?? 0 });

    if (!general || !destCity) {
      return { kind: "deny", reason: "정보를 찾을 수 없습니다." };
    }

    if (destCity.nationId !== general.nationId) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "아국입니다." };
  }
}
