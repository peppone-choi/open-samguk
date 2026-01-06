import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

/**
 * 특정 외교 상태일 때만 명령 가능
 * 레거시: AllowDiplomacyBetweenStatus
 */
export class AllowDiplomacyBetweenStatusConstraint implements Constraint {
  name = "AllowDiplomacyBetweenStatus";

  /**
   * @param allowList 허용되는 외교 상태 코드 배열
   * @param errorMsg 허용되지 않을 때 표시할 에러 메시지
   */
  constructor(
    private allowList: string[],
    private errorMsg: string,
  ) {}

  requires(ctx: ConstraintContext) {
    const destNationId = ctx.args.destNationId;
    const nationId = ctx.nationId ?? 0;
    return [
      { kind: "nation" as const, id: nationId },
      { kind: "destNation" as const, id: destNationId },
    ];
  }

  test(ctx: ConstraintContext, view: StateView): ConstraintResult {
    // 외교 상태 검사는 WorldSnapshot.diplomacy 직접 접근 필요
    // StateView는 diplomacy 접근 미지원 → Command.run에서 직접 검사 필요
    return { kind: "allow" };
  }

  /**
   * 외부에서 직접 호출할 수 있는 검사 함수
   */
  checkDiplomacy(state: string | undefined): ConstraintResult {
    if (state === undefined) {
      return { kind: "deny", reason: this.errorMsg };
    }

    if (this.allowList.includes(state)) {
      return { kind: "allow" };
    }
    return { kind: "deny", reason: this.errorMsg };
  }

  getAllowList(): string[] {
    return this.allowList;
  }

  getErrorMsg(): string {
    return this.errorMsg;
  }
}
