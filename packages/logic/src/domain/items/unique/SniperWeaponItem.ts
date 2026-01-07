/**
 * 수극(저격) - che_저격_수극.php 포팅
 * [전투] 전투 개시 시 저격. 1회용
 */
import { BaseItem } from "../BaseItem.js";

export class SniperWeaponItem extends BaseItem {
  readonly code = "che_저격_수극";
  readonly rawName = "수극";
  readonly name = "수극(저격)";
  readonly info = "[전투] 전투 개시 시 저격. 1회용";
  readonly type = "item" as const;
  readonly cost = 1000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 1000;

  // TODO: getBattlePhaseSkillTriggerList 구현
  // new che_저격시도(unit, TYPE_CONSUMABLE_ITEM, 1, 20, 40),
  // new che_저격발동(unit, TYPE_CONSUMABLE_ITEM)
}
