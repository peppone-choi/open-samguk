import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 현재 도시가 보급이 연결되어 있어야 함
 * Legacy: SuppliedCity.php
 */
export class SuppliedCityConstraint implements Constraint {
  name = "SuppliedCity";

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    if (city.supply === 1) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "고립된 도시입니다." };
  }
}
