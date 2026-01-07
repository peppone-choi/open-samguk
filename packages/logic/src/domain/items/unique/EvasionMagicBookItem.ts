/**
 * 태평요술(회피) - che_회피_태평요술.php 포팅
 * [전투] 회피 확률 +20%p
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class EvasionMagicBookItem extends BaseItem {
  readonly code = "che_회피_태평요술";
  readonly rawName = "태평요술";
  readonly name = "태평요술(회피)";
  readonly info = "[전투] 회피 확률 +20%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warAvoidRatio") {
      return value + 0.2;
    }
    return value;
  }
}
