/**
 * 정력견혈산(의술) - che_의술_정력견혈산.php 포팅
 * [군사] 매 턴마다 자신(80%) 부상 회복
 */
import { BaseItem } from "../BaseItem.js";

export class HealingPowderItem extends BaseItem {
  readonly code = "che_의술_정력견혈산";
  readonly rawName = "정력견혈산";
  readonly name = "정력견혈산(의술)";
  readonly info = "[군사] 매 턴마다 자신(80%) 부상 회복";
  readonly type = "item" as const;
  readonly cost = 150;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
