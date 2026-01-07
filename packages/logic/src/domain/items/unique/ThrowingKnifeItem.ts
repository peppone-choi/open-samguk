/**
 * 비도(저격) - che_저격_비도.php 포팅
 * [전투] 새로운 상대와 전투 시 50% 확률로 저격 발동, 성공 시 사기+20
 */
import { BaseItem } from "../BaseItem.js";

export class ThrowingKnifeItem extends BaseItem {
  readonly code = "che_저격_비도";
  readonly rawName = "비도";
  readonly name = "비도(저격)";
  readonly info = "[전투] 새로운 상대와 전투 시 50% 확률로 저격 발동, 성공 시 사기+20";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  // TODO: getBattlePhaseSkillTriggerList 구현
  // new che_저격시도(unit, TYPE_ITEM, 0.5, 20, 40),
  // new che_저격발동(unit, TYPE_ITEM)
}
