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
    // 상대가 지역/도시 제한 병종인 경우 보너스
    const oppose = unit.getOppose?.();
    if (oppose && "crewType" in oppose) {
      // 지역/도시 병종인지 확인 (TODO: UnitRegistry 연동 필요)
      return [1.15, 0.85];
    }
    return [1, 1];
  }
}
