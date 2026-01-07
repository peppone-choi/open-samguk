import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class ReqCityTrustConstraint implements Constraint {
  name = "ReqCityTrust";

  constructor(private reqVal: number) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    const trust = city.trust ?? 0;

    if (trust >= this.reqVal) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "민심이 낮아 주민들이 도망갑니다." };
  }
}
