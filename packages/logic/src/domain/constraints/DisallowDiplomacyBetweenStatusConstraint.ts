import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  StateView,
} from "../Constraint.js";

/**
 * 특정 외교 상태일 때 명령 불가
 * 레거시: DisallowDiplomacyBetweenStatus
 */
export class DisallowDiplomacyBetweenStatusConstraint implements Constraint {
  name = "DisallowDiplomacyBetweenStatus";

  /**
   * @param disallowList 상태 → 에러 메시지 맵
   * 예: { '0': '아국과 이미 교전중입니다.', '1': '아국과 이미 선포중입니다.' }
   */
  constructor(private disallowList: Record<string, string>) {}

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
    //
    // 향후 개선: StateView에 getDiplomacy(srcId, destId) 추가 필요
    // 현재는 allow 반환하고, Command에서 실제 검사 수행
    return { kind: "allow" };
  }

  /**
   * 외부에서 직접 호출할 수 있는 검사 함수
   */
  checkDiplomacy(state: string | undefined): ConstraintResult {
    if (state === undefined) {
      return { kind: "allow" };
    }

    const errorMsg = this.disallowList[state];
    if (errorMsg) {
      return { kind: "deny", reason: errorMsg };
    }
    return { kind: "allow" };
  }

  getDisallowList(): Record<string, string> {
    return this.disallowList;
  }
}
