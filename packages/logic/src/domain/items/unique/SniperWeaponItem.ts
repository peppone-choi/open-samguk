import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { SniperAttemptTrigger, SniperActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

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

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new SniperAttemptTrigger(unit, RaiseType.ITEM, 1, 20, 40),
      new SniperActivateTrigger(unit, RaiseType.ITEM)
    );
  }
}
