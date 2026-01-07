/**
 * 둔갑천서(필살) - che_필살_둔갑천서.php 포팅
 * [전투] 필살 확률 +20%p
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class KillingBlowBookItem extends BaseItem {
  readonly code = "che_필살_둔갑천서";
  readonly rawName = "둔갑천서";
  readonly name = "둔갑천서(필살)";
  readonly info = "[전투] 필살 확률 +20%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warCriticalRatio") {
      return value + 0.2;
    }
    return value;
  }
}
