import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 징병 가능 병종 여부 확인
 * 레거시: AvailableRecruitCrewType.php
 */
export class AvailableRecruitCrewTypeConstraint implements Constraint {
  name = "AvailableRecruitCrewType";

  constructor(private crewType: number) {}

  requires(ctx: ConstraintContext) {
    return [
      { kind: "general" as const, id: ctx.actorId },
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    // TODO: GameUnitConst.isValid() 에 해당하는 로직 포팅 필요
    // 현재는 모든 병종을 허용하는 상태로 구현
    return { kind: "allow" };
  }
}
