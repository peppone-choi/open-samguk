import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { GameConst } from "../GameConst.js";

export class BeOpeningPartConstraint implements Constraint {
  name = "BeOpeningPart";

  requires(ctx: ConstraintContext) {
    return [{ kind: "env" as const, key: "relYear" }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const relYear = ctx.env.relYear ?? 0;

    if (relYear < GameConst.openingPartYear) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "초반이 지났습니다." };
  }
}
