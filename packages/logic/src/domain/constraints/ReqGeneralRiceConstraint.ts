import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 장수 군량이 충분해야 함
 */
export class ReqGeneralRiceConstraint implements Constraint {
  name = "ReqGeneralRice";
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

    if (general.rice >= this.amount) {
      return { kind: "allow" };
    }

    return {
      kind: "deny",
      reason: `군량이 부족합니다. (필요: ${this.amount}, 보유: ${general.rice})`,
    };
  }
}
