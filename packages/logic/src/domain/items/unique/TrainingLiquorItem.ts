/**
 * 청주(훈련) - che_훈련_청주.php 포팅
 * [내정] 훈련 효과 +30%
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class TrainingLiquorItem extends BaseItem {
  readonly code = "che_훈련_청주";
  readonly rawName = "청주";
  readonly name = "청주(훈련)";
  readonly info = "[내정] 훈련 효과 +30%";
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
    if (turnType === "훈련" && varType === "score") {
      return value * 1.3;
    }
    return value;
  }
}
