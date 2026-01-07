import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 수도가 아니어야 함
 * @param allowChief - true인 경우, 수뇌(officer_level 2-4)는 수도에서도 허용
 */
export class NotCapitalConstraint implements Constraint {
  name = "NotCapital";

  constructor(private allowChief: boolean = false) {}

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const general = view.get({ kind: "general", id: ctx.actorId });
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });

    if (!general || !nation) {
      return { kind: "deny", reason: "정보를 찾을 수 없습니다." };
    }

    if (nation.capital !== general.cityId) {
      return { kind: "allow" };
    }

    // 수뇌는 예외 허용
    if (this.allowChief && general.officerLevel >= 2 && general.officerLevel <= 4) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "이미 수도입니다." };
  }
}
