/**
 * 오악진형도(척사) - che_척사_오악진형도.php 포팅
 * [전투] 지역·도시 병종 상대로 대미지 +15%, 아군 피해 -15%
 */
import { BaseItem } from "../BaseItem.js";
import type { WarPowerMultiplier, WarUnitReadOnly } from "../types.js";

export class ExorcismMapItem extends BaseItem {
  readonly code = "che_척사_오악진형도";
  readonly rawName = "오악진형도";
  readonly name = "오악진형도(척사)";
  readonly info = "[전투] 지역·도시 병종 상대로 대미지 +15%, 아군 피해 -15%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getWarPowerMultiplier(unit: WarUnitReadOnly): WarPowerMultiplier {
    const oppose = unit.getOppose?.();
    if (!oppose) return [1, 1];

    // 상대 병종이 특수 병종(지역/도시 요구)인지 확인
    // 레거시: $opposeCrewType->reqCities() || $opposeCrewType->reqRegions()
    // Heuristic: ID 1000 이상이며 100의 배수가 아닌 경우 특수 병종으로 간주 (1100, 1200, 1300, 1400 제외)
    const crewType = (oppose as any).crewType;
    if (typeof crewType === "number" && crewType >= 1000) {
      if (crewType % 100 !== 0) {
        return [1.15, 0.85];
      }
    }

    return [1, 1];
  }
}
