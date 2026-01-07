import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 장수 자금이 충분해야 함
 */
export class ReqGeneralGoldConstraint implements Constraint {
  name = "ReqGeneralGold";
  private amount: number;

  constructor(amount: number) {
    this.amount = amount;
  }

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.gold >= this.amount) {
      return { kind: "allow" };
    }

    return {
      kind: "deny",
      reason: `자금이 부족합니다. (필요: ${this.amount}, 보유: ${general.gold})`,
    };
  }
}
