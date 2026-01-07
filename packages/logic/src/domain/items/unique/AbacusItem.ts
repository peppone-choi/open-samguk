/**
 * 주판(조달) - che_조달_주판.php 포팅
 * [내정] 물자조달 성공 확률 +20%p, 물자조달 획득량 +100%p
 */
import { BaseItem } from "../BaseItem.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class AbacusItem extends BaseItem {
  readonly code = "che_조달_주판";
  readonly rawName = "주판";
  readonly name = "주판(조달)";
  readonly info = "[내정] 물자조달 성공 확률 +20%p, 물자조달 획득량 +100%p";
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
    if (turnType === "조달") {
      if (varType === "success") return value + 0.2;
      if (varType === "score") return value * 2;
    }
    return value;
  }
}
