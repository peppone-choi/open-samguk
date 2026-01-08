/**
 * 노군입산부(간파) - che_간파_노군입산부.php 포팅
 * [전투] 상대 회피 확률 -25%p, 상대 필살 확률 -10%p
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class InsightBookItem extends BaseItem {
  readonly code = "che_간파_노군입산부";
  readonly rawName = "노군입산부";
  readonly name = "노군입산부(간파)";
  readonly info = "[전투] 상대 회피 확률 -25%p, 상대 필살 확률 -10%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcOpposeStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    if (statName === "warAvoidRatio") {
      return value - 0.25;
    }
    if (statName === "warCriticalRatio") {
      return value - 0.1;
    }
    return value;
  }
}
