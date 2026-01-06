import type {
  WarUnit,
  WarUnitCity,
  WarUnitTrigger,
  WarContext,
} from "../types";

/**
 * Charge Continue Trigger (돌격지속)
 * 공격 시 대등/유리한 병종에게는 퇴각 전까지 계속 전투
 */
export class ChargeContinueTrigger implements WarUnitTrigger {
  static readonly PRIORITY_POST = 2000;

  unit: WarUnit;
  readonly priority = ChargeContinueTrigger.PRIORITY_POST + 900;

  constructor(unit: WarUnit) {
    this.unit = unit;
  }

  process(context: WarContext): void {
    const self = this.unit;
    const oppose = self.oppose;

    // 성벽 상대는 패스
    if (!oppose || this.isWarUnitCity(oppose)) {
      return;
    }

    // 수비측이면 패스
    if (!context.isAttacker) {
      return;
    }

    // 병종 상성 계산 - WarUnit이면 crewType 비교
    const opposeUnit = oppose as WarUnit;
    const attackCoef = this.getAttackCoef(self.crewType, opposeUnit.crewType);

    if (attackCoef < 1) {
      // 불리한 병종: 상대가 선제 스킬 있고 페이즈 거의 끝나면 페이즈 -1
      if (opposeUnit.hasActivatedSkillOnLog("선제") > 0) {
        // 페이즈 -1 처리는 context에서 수행
        context.bonusPhase = (context.bonusPhase || 0) - 1;
      }
      return;
    }

    // 대등/유리한 병종이고 페이즈 거의 끝나면 +1
    context.bonusPhase = (context.bonusPhase || 0) + 1;
  }

  private isWarUnitCity(oppose: WarUnit | WarUnitCity): oppose is WarUnitCity {
    return "wall" in oppose;
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
