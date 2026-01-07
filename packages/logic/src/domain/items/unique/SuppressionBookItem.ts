/**
 * 박혁론(진압) - che_진압_박혁론.php 포팅
 * [내정] 진압 효과 증가
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class SuppressionBookItem extends BaseItem {
  readonly code = "che_진압_박혁론";
  readonly rawName = "박혁론";
  readonly name = "박혁론(진압)";
  readonly info = "[내정] 진압 효과 +30%";
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
    if (turnType === "진압" && varType === "score") {
      return value * 1.3;
    }
    return value;
  }
}
