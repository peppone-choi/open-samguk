import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { JosaUtil } from "@sammo/common";

export class RemainCityCapacityConstraint implements Constraint {
  name = "RemainCityCapacity";
  private key: string;
  private keyNick: string;

  constructor(key: string, keyNick: string) {
    this.key = key;
    this.keyNick = keyNick;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "city" as const, id: ctx.cityId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });

    if (!city) {
      return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
    }

    const current = city[this.key] ?? 0;
    const max = city[`${this.key}Max`] ?? 0;

    if (current < max) {
      return { kind: "allow" };
    }

    const josaUn = JosaUtil.pick(this.keyNick, "은");
    return {
      kind: "deny",
      reason: `${this.keyNick}${josaUn} 충분합니다.`,
    };
  }
}
