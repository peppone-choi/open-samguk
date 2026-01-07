/**
 * 전국책(집중) - che_집중_전국책.php 포팅
 * [전투] 계략 성공 시 대미지 +30%
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class ConcentrationBookItem extends BaseItem {
  readonly code = "che_집중_전국책";
  readonly rawName = "전국책";
  readonly name = "전국책(집중)";
  readonly info = "[전투] 계략 성공 시 대미지 +30%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warMagicSuccessDamage") {
      return value * 1.3;
    }
    return value;
  }
}
