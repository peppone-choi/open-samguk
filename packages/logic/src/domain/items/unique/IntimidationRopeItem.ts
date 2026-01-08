/**
 * 조목삭(위압) - che_위압_조목삭.php 포팅
 * [전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { IntimidationAttemptTrigger, IntimidationActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class IntimidationRopeItem extends BaseItem {
  readonly code = "che_위압_조목삭";
  readonly rawName = "조목삭";
  readonly name = "조목삭(위압)";
  readonly info = "[전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new IntimidationAttemptTrigger(unit, RaiseType.ITEM),
      new IntimidationActivateTrigger(unit, RaiseType.ITEM)
    );
  }
}
