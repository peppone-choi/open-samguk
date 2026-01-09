import type { WarUnit, WarUnitCity, WarUnitTriggerContext, WarUnitTriggerResult } from "../types";
import { isWarUnit, RaiseType, type RaiseTypeValue } from "../types";
import type { WarUnitTrigger } from "../../WarUnitTriggerRegistry.js";
import { TriggerPriority } from "../../WarUnitTriggerRegistry.js";

/**
 * Charge Continue Trigger (돌격지속)
 * 공격 시 대등/유리한 병종에게는 퇴각 전까지 계속 전투
 */
export class ChargeContinueTrigger implements WarUnitTrigger {
  readonly name = "돌격지속";
  readonly priority = TriggerPriority.POST + 900;
  readonly raiseType: RaiseTypeValue;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.SPECIAL
  ) {
    this.raiseType = raiseType;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const oppose = ctx.oppose;

    // 성벽 상대는 패스
    if (!isWarUnit(oppose)) {
      return false;
    }

    // 수비측이면 패스
    if (!ctx.isAttacker) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    // Only proceed if oppose is a WarUnit
    if (!isWarUnit(oppose)) {
      return { delta: {}, continueExecution: true };
    }

    // 병종 상성 계산 - WarUnit이면 crewType 비교
    const attackCoef = this.getAttackCoef(self.crewType, oppose.crewType);

    if (attackCoef < 1) {
      // 불리한 병종: 상대가 선제 스킬 있고 페이즈 거의 끝나면 페이즈 -1
      if (oppose.hasActivatedSkillOnLog("선제") > 0) {
        ctx.selfEnv["bonusPhase"] = ((ctx.selfEnv["bonusPhase"] as number) || 0) - 1;
      }
      return { delta: {}, continueExecution: true };
    }

    // 대등/유리한 병종이고 페이즈 거의 끝나면 +1
    ctx.selfEnv["bonusPhase"] = ((ctx.selfEnv["bonusPhase"] as number) || 0) + 1;

    return { delta: {}, continueExecution: true };
  }

  /**
   * 병종 상성 계수 계산 (간략화)
   * 실제 구현은 CrewType 시스템에 의존
   */
  private getAttackCoef(selfCrewType: number, opposeCrewType: number): number {
    // 기본값: 대등
    // TODO: 실제 병종 상성 테이블 참조
    if (selfCrewType === opposeCrewType) return 1;
    return 1;
  }
}
