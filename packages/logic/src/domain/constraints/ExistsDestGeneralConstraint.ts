import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 대상 장수가 존재해야 함
 * Legacy: ExistsDestGeneral.php
 */
export class ExistsDestGeneralConstraint implements Constraint {
  name = "ExistsDestGeneral";

  requires(ctx: ConstraintContext) {
    return [{ kind: "destGeneral" as const, id: ctx.destGeneralId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const destGeneral = view.get({ kind: "destGeneral", id: ctx.destGeneralId ?? 0 });

    if (!destGeneral) {
      return { kind: "deny", reason: "없는 장수입니다." };
    }

    return { kind: "allow" };
  }
}
