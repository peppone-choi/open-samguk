import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 국가 커맨드 재사용 대기시간 확인
 */
export class AvailableNationCommandConstraint implements Constraint {
  name = "AvailableNationCommand";

  constructor(private commandClassName: string) {}

  requires(ctx: ConstraintContext) {
    return [
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
      { kind: "env" as const, key: "yearMonth" },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
    if (!nation) return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };

    const nextExecute = nation.aux?.nextExecute || {};
    const nextTurn = nextExecute[this.commandClassName] || 0;
    const currentTurn = view.get({ kind: "env", key: "yearMonth" });

    if (currentTurn < nextTurn) {
      const remainTurn = nextTurn - currentTurn;
      return { kind: "deny", reason: `${remainTurn}턴 더 기다려야 합니다.` };
    }

    return { kind: "allow" };
  }
}
