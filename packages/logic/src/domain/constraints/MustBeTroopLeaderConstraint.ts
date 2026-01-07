import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class MustBeTroopLeaderConstraint implements Constraint {
  name = "MustBeTroopLeader";

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.no === general.troop) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "부대장이 아닙니다." };
  }
}
