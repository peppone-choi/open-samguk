/**
 * 매화수전(저격) - che_저격_매화수전.php 포팅
 * [전투] 저격 확률 증가
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class PlumBlossomDartItem extends BaseItem {
  readonly code = "che_저격_매화수전";
  readonly rawName = "매화수전";
  readonly name = "매화수전(저격)";
  readonly info = "[전투] 저격 확률 +20%p";
  readonly type = "item" as const;
  readonly cost = 400;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "sniperProb") {
      return value + 0.2;
    }
    return value;
  }
}
