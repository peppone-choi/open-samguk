import { WarUnit, WarUnitTrigger, RaiseType } from "./specials/types.js";
import * as WarTriggers from "./triggers/war/index.js";

/**
 * 병종 어빌리티 매핑 레지스트리
 * 병종 데이터(JSON)에 정의된 문자열 코드를 실제 전투 트리거 객체로 변환합니다.
 */
export class UnitAbilityRegistry {
  /** 어빌리티 코드와 트리거 생성 함수 간의 매핑 테이블 */
  private static readonly abilityMap: Record<string, (unit: WarUnit) => WarUnitTrigger> = {
    che_방어력증가5p: (unit) => new WarTriggers.DefenseBoost5pTrigger(unit),
    che_기병병종전투: (unit) => new WarTriggers.CavalryBattleTrigger(unit, RaiseType.UNIT),
    che_성벽부상무효: (unit) => new WarTriggers.WallInjuryImmuneTrigger(unit, RaiseType.UNIT),
    che_선제사격시도: (unit) => new WarTriggers.PreemptiveShotAttemptTrigger(unit, RaiseType.UNIT),
    che_저지시도: (unit) => new WarTriggers.BlockAttemptTrigger(unit, RaiseType.UNIT),
    // TODO: 추가 어빌리티 매핑 보강
    che_성벽선제: (unit) => new WarTriggers.PreemptiveShotActivateTrigger(unit),
  };

  /**
   * 지정된 코드에 해당하는 트리거 인스턴스를 생성합니다.
   * 
   * @param code 어빌리티 코드
   * @param unit 트리거가 적용될 유닛
   * @returns 트리거 인스턴스 또는 null (정의되지 않은 경우)
   */
  public static createTrigger(code: string, unit: WarUnit): WarUnitTrigger | null {
    const factory = this.abilityMap[code];
    if (!factory) return null;
    return factory(unit);
  }

  /**
   * 유닛의 병종 데이터에 정의된 모든 어빌리티 트리거를 생성하여 반환합니다.
   * 전투 시작 시 WarEngine에서 호출되어 각 유닛에게 트리거를 부여합니다.
   * 
   * @param unit 대상 유닛
   * @returns 생성된 트리거 배열
   */
  public static getTriggersForUnit(unit: WarUnit): WarUnitTrigger[] {
    const triggers: WarUnitTrigger[] = [];
    const unitData = unit.unitData;
    if (!unitData) return [];

    // 병종의 공격/방어/특수 어빌리티 코드를 추출 및 필터링
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
