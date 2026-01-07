import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 군주여야 함 (officer_level == 12)
 */
export class BeLordConstraint implements Constraint {
  name = "BeLord";

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.officerLevel === 12) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "군주가 아닙니다." };
  }
}
