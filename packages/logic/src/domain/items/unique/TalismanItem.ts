/**
 * 태현청생부(부적) - che_부적_태현청생부.php 포팅
 * [특수] 부적 아이템
 */
import { BaseItem } from "../BaseItem.js";

export class TalismanItem extends BaseItem {
  readonly code = "che_부적_태현청생부";
  readonly rawName = "태현청생부";
  readonly name = "태현청생부(부적)";
  readonly info = "[특수] 특수 부적 효과";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
