/**
 * 논어집해(환술) - che_환술_논어집해.php 포팅
 * [전투] 계략 성공 확률 +10%p, 계략 성공 시 대미지 +20%
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class IllusionBookItem extends BaseItem {
  readonly code = "che_환술_논어집해";
  readonly rawName = "논어집해";
  readonly name = "논어집해(환술)";
  readonly info = "[전투] 계략 성공 확률 +10%p, 계략 성공 시 대미지 +20%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    if (statName === "warMagicSuccessProb") {
      return value + 0.1;
    }
    if (statName === "warMagicSuccessDamage") {
      return value * 1.2;
    }
    return value;
  }
}
