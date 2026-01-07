/**
 * 과실주(상성보정) - che_상성보정_과실주.php 포팅
 * [전투] 병종 상성 불리 보정
 */
import { BaseItem } from "../BaseItem.js";

export class TypeCorrectionLiquorItem extends BaseItem {
  readonly code = "che_상성보정_과실주";
  readonly rawName = "과실주";
  readonly name = "과실주(상성보정)";
  readonly info = "[전투] 병종 상성 불리 보정";
  readonly type = "item" as const;
  readonly cost = 150;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 30;
}
