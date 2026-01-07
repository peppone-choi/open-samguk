/**
 * 도기(보물) - che_보물_도기.php 포팅
 * [내정] 상업/치안 보너스
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class PotteryItem extends BaseItem {
  readonly code = "che_보물_도기";
  readonly rawName = "도기";
  readonly name = "도기(보물)";
  readonly info = "[내정] 상업투자 효과 +20%, 치안강화 효과 +20%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcDomestic(
    turnType: DomesticTurnType,
    varType: DomesticVarType,
    value: number,
    _aux?: unknown
  ): number {
    if ((turnType === "상업투자" || turnType === "치안강화") && varType === "score") {
      return value * 1.2;
    }
    return value;
  }
}
