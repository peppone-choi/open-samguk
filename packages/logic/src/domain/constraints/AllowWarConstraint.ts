import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

export class AllowWarConstraint implements Constraint {
  name = "AllowWar";

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });

    if (!nation) {
      return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };
    }

    if (nation.war === 0) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "현재 전쟁 금지입니다." };
  }
}
