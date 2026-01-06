import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

/**
 * 대상 도시가 보급이 연결되어 있어야 함
 */
export class SuppliedDestCityConstraint implements Constraint {
  name = "SuppliedDestCity";

  requires(ctx: ConstraintContext) {
    return [{ kind: "destCity" as const, id: ctx.destCityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const destCity = view.get({ kind: "destCity", id: ctx.destCityId ?? 0 });

    if (!destCity) {
      return { kind: "deny", reason: "대상 도시 정보를 찾을 수 없습니다." };
    }

    if (destCity.supply === 1) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "고립된 도시입니다." };
  }
}
