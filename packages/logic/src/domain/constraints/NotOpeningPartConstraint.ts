import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { GameConst } from "../GameConst.js";

export class NotOpeningPartConstraint implements Constraint {
  name = "NotOpeningPart";

  requires(ctx: ConstraintContext) {
    return [{ kind: "env" as const, key: "relYear" }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const relYear = ctx.env.relYear ?? 0;

    if (relYear >= GameConst.openingPartYear) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "초반 제한 중에는 불가능합니다." };
  }
}
