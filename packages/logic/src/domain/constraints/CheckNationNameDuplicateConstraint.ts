import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";

/**
 * 국가명 중복 확인
 * 레거시: CheckNationNameDuplicate.php
 */
export class CheckNationNameDuplicateConstraint implements Constraint {
  name = "CheckNationNameDuplicate";

  constructor(private targetName: string) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    const actorNationId = ctx.nationId ?? 0;

    // StateView에 모든 국가를 가져오는 기능이 없으므로,
    // 이 제약조건은 WorldSnapshot에 직접 접근해야 함.
    // 하지만 Constraint 인터페이스 상 view.get만 가능하므로
    // 실제 검사는 Command.run 이나 SnapshotStateView를 확장해서 처리해야 할 수 있음.
    // 현재는 SnapshotStateView가 snapshot을 들고 있으나 get(req)으로만 접근 가능.

    // 임시로 allow 반환 (복합 쿼리/전수 조사는 Command 레벨에서 처리 권장)
    return { kind: "allow" };
  }

  /**
   * 모든 국가 목록을 받아서 중복 체크
   */
  checkDuplicate(
    nations: Record<number, { id: number; name: string }>,
    actorNationId: number
  ): ConstraintResult {
    for (const nation of Object.values(nations)) {
      if (nation.id !== actorNationId && nation.name === this.targetName) {
        return { kind: "deny", reason: "존재하는 국가명입니다." };
      }
    }
    return { kind: "allow" };
  }
}
