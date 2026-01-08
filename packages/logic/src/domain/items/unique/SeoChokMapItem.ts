/**
 * 서촉지형도(행동) - che_행동_서촉지형도.php 포팅
 * [행동] 서촉 지역 이동 시 행동력 감소
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class SeoChokMapItem extends BaseItem {
  readonly code = "che_행동_서촉지형도";
  readonly rawName = "서촉지형도";
  readonly name = "서촉지형도(행동)";
  readonly info = "[행동] 서촉 지역 이동 시 행동력 보너스";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "initWarPhase") {
      return value + 2;
    }
    return value;
  }
}
