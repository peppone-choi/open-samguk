/**
 * 박혁론(진압) - che_진압_박혁론.php 포팅
 * [전투] 상대의 계략 되돌림, 격노 불가
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { WarActivateSkillsTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class SuppressionBookItem extends BaseItem {
  readonly code = "che_진압_박혁론";
  readonly rawName = "박혁론";
  readonly name = "박혁론(진압)";
  readonly info = "[전투] 상대의 계략 되돌림, 격노 불가";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      // 상대방에게 반계불가(계략 되돌림 불가), 격노불가 스킬 부여
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, true, ["반계불가", "격노불가"])
    );
  }
}
