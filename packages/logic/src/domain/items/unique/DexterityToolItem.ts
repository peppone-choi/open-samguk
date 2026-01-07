/**
 * 동작(숙련) - che_숙련_동작.php 포팅
 * [내정] 숙련도 증가 효과
 */
import { BaseItem } from "../BaseItem.js";

export class DexterityToolItem extends BaseItem {
  readonly code = "che_숙련_동작";
  readonly rawName = "동작";
  readonly name = "동작(숙련)";
  readonly info = "[내정] 숙련도 증가량 +20%";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
