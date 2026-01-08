/**
 * 태현청생부(부적) - che_부적_태현청생부.php 포팅
 * [전투] 저격 불가, 부상 없음
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { InjuryImmuneTrigger, WarActivateSkillsTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";
import type { GeneralReadOnly, StatName } from "../types.js";

export class TalismanItem extends BaseItem {
  readonly code = "che_부적_태현청생부";
  readonly rawName = "태현청생부";
  readonly name = "태현청생부(부적)";
  readonly info = "[전투] 저격 불가, 부상 없음";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, _aux?: unknown): number {
    // 부상 확률 제거
    if (statName === "injuryProb") {
      return value - 1;
    }
    return value;
  }

  getBattleInitSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new InjuryImmuneTrigger(unit),
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["저격불가"])
    );
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["저격불가"])
    );
  }
}
