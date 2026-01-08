/**
 * 납금박산로(내정) - che_내정_납금박산로.php 포팅
 * [내정] 내정 성공률 +15%p
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

const DOMESTIC_TURN_TYPES = ["상업", "농업", "기술", "성벽", "수비", "치안", "민심", "인구"];

export class DomesticBoostItem extends BaseItem {
  readonly code = "che_내정_납금박산로";
  readonly rawName = "납금박산로";
  readonly name = "납금박산로(내정)";
  readonly info = "[내정] 내정 성공률 +15%p";
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
    if (DOMESTIC_TURN_TYPES.includes(turnType) && varType === "success") {
      return value + 0.15;
    }
    return value;
  }
}
