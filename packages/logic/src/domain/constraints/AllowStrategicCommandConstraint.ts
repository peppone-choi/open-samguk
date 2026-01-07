import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 전략 커맨드 사용 가능 여부 (전쟁 금지 상태 확인)
 * 레거시: AllowStrategicCommand.php
 */
export class AllowStrategicCommandConstraint implements Constraint {
  name = "AllowStrategicCommand";

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
    if (!nation) return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };

    // 레거시: nation.war == 0 이면 허용
    if (nation.warState === 0) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "현재 전쟁 금지입니다." };
  }
}
