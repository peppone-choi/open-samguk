/**
 * 평만지장도(전략) - che_전략_평만지장도.php 포팅
 * [전략] 남중 지역 이동 및 전투 보너스
 */
import { BaseItem } from "../BaseItem.js";

export class StrategyMapItem extends BaseItem {
  readonly code = "che_전략_평만지장도";
  readonly rawName = "평만지장도";
  readonly name = "평만지장도(전략)";
  readonly info = "[전략] 남중 지역 이동 및 전투 보너스";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
