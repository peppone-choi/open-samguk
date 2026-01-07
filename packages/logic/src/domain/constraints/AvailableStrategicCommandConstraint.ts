import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 전략 커맨드 가용 여부 (기한 확인)
 * 레거시: AvailableStrategicCommand.php
 */
export class AvailableStrategicCommandConstraint implements Constraint {
  name = "AvailableStrategicCommand";

  constructor(private turnLimit: number) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
    if (!nation) return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };

    if (nation.strategicCmdLimit <= this.turnLimit) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "전략기한이 남았습니다." };
  }
}
