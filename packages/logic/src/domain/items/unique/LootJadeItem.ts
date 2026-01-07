/**
 * 옥벽(약탈) - che_약탈_옥벽.php 포팅
 * [전투] 새로운 상대와 전투 시 20% 확률로 상대 금, 쌀 10% 약탈
 */
import { BaseItem } from "../BaseItem.js";

export class LootJadeItem extends BaseItem {
  readonly code = "che_약탈_옥벽";
  readonly rawName = "옥벽";
  readonly name = "옥벽(약탈)";
  readonly info = "[전투] 새로운 상대와 전투 시 20% 확률로 상대 금, 쌀 10% 약탈";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getBattlePhaseSkillTriggerList 구현
  // new che_약탈시도(unit, TYPE_ITEM, 0.2, 0.1),
  // new che_약탈발동(unit, TYPE_ITEM)
}
