import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { JosaUtil } from "@sammo/common";

export class RemainCityTrustConstraint implements Constraint {
  name = "RemainCityTrust";
  private keyNick: string;
  private maxVal: number;

  constructor(keyNick: string, maxVal: number = 100) {
    this.keyNick = keyNick;
    this.maxVal = maxVal;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    if (city.trust < this.maxVal) {
      return { kind: "allow" };
    }

    const josaUn = JosaUtil.pick(this.keyNick, "은");
    return {
      kind: "deny",
      reason: `${this.keyNick}${josaUn} 충분합니다.`,
    };
  }
}
