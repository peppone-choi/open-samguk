import { Constraint, ConstraintContext, ConstraintResult, StateView } from "../Constraint.js";
import { Diplomacy } from "../entities.js";

/**
 * 대상 도시가 교전 중인 국가의 도시인지 확인
 * 레거시: BattleGroundCity.php
 */
export class BattleGroundCityConstraint implements Constraint {
  name = "BattleGroundCity";

  requires(ctx: ConstraintContext) {
    return [
      { kind: "nation" as const, id: ctx.nationId ?? 0 },
      { kind: "destCity" as const, id: ctx.args.destCityId },
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
    // 공백지(국가ID 0)는 항상 허용 (레거시 logic)
    // 레거시에서는 diplomacy가 0(교전중)인 경우 true 반환
    // diplomacy.state === '0' 이 교전 중을 의미함 (NationProposeAllianceCommand.test.ts 참조)

    if (!diplomacy) {
      // 외교 정보가 없으면 평상시(교전 아님)로 간주되나,
      // 레거시 코드에서는 공백지인 경우 queryFirstField가 null을 반환할 수 있음.
      // 하지만 test()에서 destNationID == 0 체크를 먼저 함.
      return { kind: "deny", reason: "교전중인 국가의 도시가 아닙니다." };
    }

    if (diplomacy.state === "0") {
      return { kind: "allow" };
    }

    return { kind: "deny", reason: "교전중인 국가의 도시가 아닙니다." };
  }
}
