import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { GameConst } from "../GameConst.js";

export class AllowJoinActionConstraint implements Constraint {
  name = "AllowJoinAction";

  requires(ctx: ConstraintContext) {
    return [{ kind: "general" as const, id: ctx.actorId }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    if (!general) {
      return { kind: "deny", reason: "장수 정보를 찾을 수 없습니다." };
    }

    if (general.makelimit === 0) {
      return { kind: "allow" };
    }

    return {
      kind: "deny",
      reason: `재야가 된지 ${GameConst.joinActionLimit}턴이 지나야 합니다.`,
    };
  }
}
