/**
 * 둔갑천서(회피) - che_회피_둔갑천서.php 포팅
 * [전투] 회피 확률 +20%p
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { EvasionAttemptTrigger, EvasionActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class EvasionBookItem extends BaseItem {
  readonly code = "che_회피_둔갑천서";
  readonly rawName = "둔갑천서";
  readonly name = "둔갑천서(회피)";
  readonly info = "[전투] 회피 확률 +20%p";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new EvasionAttemptTrigger(unit, (u) => {
        // 기본 10% + 아이템 20% = 30%
        return 0.1 + 0.2;
      }),
      new EvasionActivateTrigger(unit)
    );
  }
}
