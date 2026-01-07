/**
 * 구석(명성) - che_명성_구석.php 포팅
 * [내정] 명성 관련 보너스
 */
import { BaseItem } from "../BaseItem.js";

export class FameJewelItem extends BaseItem {
  readonly code = "che_명성_구석";
  readonly rawName = "구석";
  readonly name = "구석(명성)";
  readonly info = "[내정] 명성 관련 보너스";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
