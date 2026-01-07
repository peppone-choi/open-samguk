/**
 * 낙주(징병) - che_징병_낙주.php 포팅
 * [내정] 징병 효과 증가
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class RecruitmentLiquorItem extends BaseItem {
  readonly code = "che_징병_낙주";
  readonly rawName = "낙주";
  readonly name = "낙주(징병)";
  readonly info = "[내정] 징병 효과 +20%";
  readonly type = "item" as const;
  readonly cost = 100;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 20;

  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    if (turnType === "징병" && varType === "score") {
      return value * 1.2;
    }
    return value;
  }
}
