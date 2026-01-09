import { WarUnit, WarUnitTrigger, RaiseType } from "./specials/types.js";
import * as WarTriggers from "./triggers/war/index.js";

/**
 * 병종 어빌리티 매핑 레지스트리
 */
export class UnitAbilityRegistry {
  private static readonly abilityMap: Record<string, (unit: WarUnit) => WarUnitTrigger> = {
    che_방어력증가5p: (unit) => new WarTriggers.DefenseBoost5pTrigger(unit),
    che_기병병종전투: (unit) => new WarTriggers.CavalryBattleTrigger(unit, RaiseType.UNIT),
    che_성벽부상무효: (unit) => new WarTriggers.WallInjuryImmuneTrigger(unit, RaiseType.UNIT),
    che_선제사격시도: (unit) => new WarTriggers.PreemptiveShotAttemptTrigger(unit, RaiseType.UNIT),
    che_저지시도: (unit) => new WarTriggers.BlockAttemptTrigger(unit, RaiseType.UNIT),
    // 추가 어빌리티 매핑...
    che_성벽선제: (unit) => new WarTriggers.PreemptiveShotActivateTrigger(unit), // 임시 매핑
  };

  /**
   * 코드에 해당하는 트리거 인스턴스 생성
   */
  public static createTrigger(code: string, unit: WarUnit): WarUnitTrigger | null {
    const factory = this.abilityMap[code];
    if (!factory) return null;
    return factory(unit);
  }

  /**
   * 유닛에 대응하는 모든 어빌리티 트리거 반환
   */
  public static getTriggersForUnit(unit: WarUnit): WarUnitTrigger[] {
    const triggers: WarUnitTrigger[] = [];
    const unitData = unit.unitData; // WarUnit 인터페이스에 unitData가 있어야 함
    if (!unitData) return [];

    const codes = [unitData.attackAbility, unitData.defenseAbility, unitData.specialAbility].filter(
      (c): c is string => !!c
    );

    for (const code of codes) {
      const trigger = this.createTrigger(code, unit);
      if (trigger) triggers.push(trigger);
    }

    return triggers;
  }
}
