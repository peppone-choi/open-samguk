import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 국가 소속이어야 함 (nation != 0)
 */
export class NotBeNeutralConstraint implements Constraint {
  name = "NotBeNeutral";

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.nationId !== 0) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "재야입니다." };
  }
}
