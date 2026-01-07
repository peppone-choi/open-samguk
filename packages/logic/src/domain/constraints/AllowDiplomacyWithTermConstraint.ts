import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { Diplomacy } from "../entities.js";

/**
 * 특정 외교 상태이고 기한이 일정치 이상이어야 함
 * 레거시: AllowDiplomacyWithTerm.php
 */
export class AllowDiplomacyWithTermConstraint implements Constraint {
  name = "AllowDiplomacyWithTerm";

  /**
   * @param allowDipCode 허용되는 외교 상태 코드
   * @param allowMinTerm 허용되는 최소 기한
   * @param errorMessage 허용되지 않을 때 표시할 에러 메시지
   */
  constructor(
    private allowDipCode: string,
    private allowMinTerm: number,
    private errorMessage: string
  ) {}

  requires(ctx: ConstraintContext) {
    return [
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
      { kind: "destNation" as const, id: ctx.args.destNationId },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    // 외교 상태 검사는 WorldSnapshot.diplomacy 직접 접근 필요
    // StateView는 diplomacy 접근 미지원 -> Command.run에서 직접 검사 필요
    return { kind: "allow" };
  }

  /**
   * 외부에서 직접 호출할 수 있는 검사 함수
   */
  checkDiplomacy(diplomacy: Diplomacy | undefined): ConstraintResult {
    if (!diplomacy) {
      return { kind: "deny", reason: this.errorMessage };
    }

    if (diplomacy.state === this.allowDipCode && diplomacy.term >= this.allowMinTerm) {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: this.errorMessage };
  }

  getAllowDipCode(): string {
    return this.allowDipCode;
  }

  getAllowMinTerm(): number {
    return this.allowMinTerm;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }
}
