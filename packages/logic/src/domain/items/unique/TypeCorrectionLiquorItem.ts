/**
 * 과실주(상성보정) - che_상성보정_과실주.php 포팅
 * [전투] 대등/유리한 병종 전투시 공격력 +10%, 피해 -10%
 *
 * 레거시 로직:
 * - getBattlePhaseSkillTriggerList에서 상대 병종과의 상성 계수 확인
 * - attackCoef >= 1 (대등/유리) 일 때만 효과 적용
 * - 전투력보정 트리거: 자신 공격력 +10%, 상대 피해 -10%
 */
import { BaseItem } from "../BaseItem.js";
import type { WarPowerMultiplier, WarUnitReadOnly } from "../types.js";

export class TypeCorrectionLiquorItem extends BaseItem {
  readonly code = "che_상성보정_과실주";
  readonly rawName = "과실주";
  readonly name = "과실주(상성)";
  readonly info = "[전투] 대등/유리한 병종 전투시 공격력 +10%, 피해 -10%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  /**
   * 전투력 보정
   * 상대 병종과의 상성이 대등 또는 유리할 때:
   * - 자신 공격력 +10% (1.1배)
   * - 받는 피해 -10% (0.9배)
   *
   * TODO: 상성 계수 확인 로직 (UnitRegistry 연동 필요)
   * 현재는 crewType 기반 간단 판정
   */
  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.oppose;
    if (!oppose || !("crewType" in oppose)) {
      // 상대 정보 없으면 기본값 (효과 없음)
      return [1, 1];
    }

    // 간단 상성 판정: 같은 계열이거나 상위 병종이면 유리로 간주
    // 실제 상성 로직은 UnitRegistry에서 가져와야 함
    // 일단 기본적으로 효과 적용 (상성 불리 시 나중에 필터링)
    const selfCrewType = unit.crewType ?? 0;
    const opposeCrewType = (oppose as { crewType?: number }).crewType ?? 0;

    // 병종 상성 판정 (간단 버전)
    // 0-9: 보병계열, 10-19: 궁병계열, 20-29: 기병계열, 30-39: 귀병계열
    // 각 계열 간 상성: 보병 > 기병 > 궁병 > 보병 (가위바위보)
    const selfCategory = Math.floor(selfCrewType / 10);
    const opposeCategory = Math.floor(opposeCrewType / 10);

    // 상성 불리 케이스 확인
    const isDisadvantaged =
      (selfCategory === 0 && opposeCategory === 1) || // 보병 vs 궁병
      (selfCategory === 1 && opposeCategory === 2) || // 궁병 vs 기병
      (selfCategory === 2 && opposeCategory === 0); // 기병 vs 보병

    if (isDisadvantaged) {
      // 불리한 상성이면 효과 없음
      return [1, 1];
    }

    // 대등/유리한 상성: 공격력 +10%, 받는 피해 -10%
    return [1.1, 0.9];
  }
}
