import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 수뇌여야 함 (officer_level > 4)
 */
export class BeChiefConstraint implements Constraint {
  name = "BeChief";

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.officerLevel > 4) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "수뇌가 아닙니다." };
  }
}
