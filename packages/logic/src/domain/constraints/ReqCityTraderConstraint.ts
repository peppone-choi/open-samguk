import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class ReqCityTraderConstraint implements Constraint {
  name = "ReqCityTrader";

  constructor(private arg: number = 0) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    if (city.trade !== null || this.arg >= 2) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "도시에 상인이 없습니다." };
  }
}
