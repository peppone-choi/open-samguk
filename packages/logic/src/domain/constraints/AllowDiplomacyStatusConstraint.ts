import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { Diplomacy } from "../entities.js";

/**
 * 특정 외교 상태 중 하나라도 만족해야 함
 * 레거시: AllowDiplomacyStatus.php
 */
export class AllowDiplomacyStatusConstraint implements Constraint {
  name = "AllowDiplomacyStatus";

  /**
   * @param allowStatus 허용되는 외교 상태 코드 배열
   * @param errorMessage 허용되지 않을 때 표시할 에러 메시지
   */
  constructor(
    private allowStatus: string[],
    private errorMessage: string
  ) {}

  requires(ctx: ConstraintContext) {
    return [{ kind: "nation" as const, id: ctx.nationId ?? 0 }];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    // 외교 상태 검사는 WorldSnapshot.diplomacy 직접 접근 필요
    // StateView는 diplomacy 접근 미지원 -> Command.run에서 직접 검사 필요
    return { kind: "allow" };
  }

  /**
   * 외부에서 직접 호출할 수 있는 검사 함수
   */
  checkDiplomacy(diplomacyList: Diplomacy[]): ConstraintResult {
    const hasAllowedStatus = diplomacyList.some((dip) => this.allowStatus.includes(dip.state));

    if (hasAllowedStatus) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: this.errorMessage };
  }

  getAllowStatus(): string[] {
    return this.allowStatus;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}
