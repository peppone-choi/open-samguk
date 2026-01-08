/**
 * 탁주(사기) - che_사기_탁주.php 포팅
 * [전투] 사기 +30(한도 내). 1회용
 * [내정] 사기진작 효과 +50%
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { StatChangeTrigger } from "../../triggers/war/StatChangeTrigger.js";
import { TriggerPriority, RaiseType } from "../../WarUnitTriggerRegistry.js";
import type { DomesticTurnType, DomesticVarType } from "../types.js";

export class MoraleLiquorItem extends BaseItem {
  readonly code = "che_사기_탁주";
  readonly rawName = "탁주";
  readonly name = "탁주(사기)";
  readonly info = "[전투] 사기 +30(한도 내). 1회용\n[내정] 사기진작 효과 +50%";
  readonly type = "item" as const;
  readonly cost = 1000;
  readonly consumable = true;
  readonly buyable = true;
  readonly reqSecu = 1000;

  getBattleInitSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      StatChangeTrigger.atmosChange(unit, TriggerPriority.BEGIN + 500, RaiseType.ITEM, "+", 30)
    );
  }

  onCalcDomestic(turnType: DomesticTurnType, varType: DomesticVarType, value: number): number {
    if (turnType === "사기진작" && varType === "score") return value * 1.5;
    return value;
  }
}
