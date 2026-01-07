import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 대상 국가가 존재해야 함 (멸망하지 않았어야 함)
 */
export class ExistsDestNationConstraint implements Constraint {
  name = "ExistsDestNation";

  requires(ctx: ConstraintContext) {
    return [{ kind: "destNation" as const, id: ctx.destNationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const destNation = view.get({
      kind: "destNation",
      id: ctx.destNationId ?? 0,
    });

    if (!destNation) {
      return { kind: "deny", reason: "멸망한 국가입니다." };
    }

    // nationId가 0이 아니면 존재하는 국가
    if (destNation.id !== 0) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "멸망한 국가입니다." };
  }
}
