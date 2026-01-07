import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 방랑군이 아니어야 함 (nation.level !== 0)
 * Legacy: NotWanderingNation.php
 */
export class NotWanderingNationConstraint implements Constraint {
  name = "NotWanderingNation";

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });

    if (!nation) {
      return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };
    }

    if (nation.level !== 0) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "방랑군은 불가능합니다." };
  }
}
