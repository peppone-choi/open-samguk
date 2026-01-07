/**
 * 탁주(사기) - che_사기_탁주.php 포팅
 * [전투] 사기 +30(한도 내). 1회용
 */
import { BaseItem } from "../BaseItem.js";

export class MoraleLiquorItem extends BaseItem {
  readonly code = "che_사기_탁주";
  readonly rawName = "탁주";
  readonly name = "탁주(사기)";
  readonly info = "[전투] 사기 +30(한도 내). 1회용";
  readonly type = "item" as const;
  readonly cost = 1000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 1000;

  // TODO: getBattleInitSkillTriggerList 구현
  // new 능력치변경(unit, TYPE_CONSUMABLE_ITEM, 'atmos', '+', 30, null, GameConst.maxAtmosByWar)
}
