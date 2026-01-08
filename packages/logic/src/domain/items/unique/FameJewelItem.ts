/**
 * 구석(명성) - che_명성_구석.php 포팅
 * [기타] 명성(경험치) 획득량 +20%
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class FameJewelItem extends BaseItem {
  readonly code = "che_명성_구석";
  readonly rawName = "구석";
  readonly name = "구석(명성)";
  readonly info = "[기타] 명성(경험치) 획득량 +20%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "experience") {
      return value * 1.2;
    }
    return value;
  }
}
