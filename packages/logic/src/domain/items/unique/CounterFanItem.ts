/**
 * 파초선(반계) - che_반계_파초선.php 포팅
 * [전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 20% 확률로 되돌림
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { CounterAttemptTrigger, CounterActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class CounterFanItem extends BaseItem {
  readonly code = "che_반계_파초선";
  readonly rawName = "파초선";
  readonly name = "파초선(반계)";
  readonly info = "[전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 20% 확률로 되돌림";
  readonly type = "item" as const;
  readonly cost = 200;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcOpposeStat(
    _general: GeneralReadOnly,
    statName: StatName,
    value: number,
    _aux?: unknown
  ): number {
    if (statName === "warMagicSuccessProb") {
      return value - 0.1;
    }
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new CounterAttemptTrigger(unit, RaiseType.ITEM, 0.2),
      new CounterActivateTrigger(unit, RaiseType.ITEM)
    );
  }
}
