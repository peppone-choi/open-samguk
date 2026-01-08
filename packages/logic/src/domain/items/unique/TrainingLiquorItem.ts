/**
 * 청주(훈련) - che_훈련_청주.php 포팅
 * [전투] 훈련 +40(한도 내). 1회용
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { StatChangeTrigger } from "../../triggers/war/StatChangeTrigger.js";
import { TriggerPriority, RaiseType } from "../../WarUnitTriggerRegistry.js";

export class TrainingLiquorItem extends BaseItem {
  readonly code = "che_훈련_청주";
  readonly rawName = "청주";
  readonly name = "청주(훈련)";
  readonly info = "[전투] 훈련 +40(한도 내). 1회용";
  readonly type = "item" as const;
  readonly cost = 1000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 1000;

  getBattleInitSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      StatChangeTrigger.trainChange(unit, TriggerPriority.BEGIN + 500, RaiseType.ITEM, "+", 40)
    );
  }
}
