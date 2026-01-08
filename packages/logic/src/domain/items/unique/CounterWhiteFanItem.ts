/**
 * 백우선(반계) - che_반계_백우선.php 포팅
 * [전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 30% 확률로 되돌림,
 *        반목 성공시 대미지 추가(+60% → +100%), 소모 군량 +10%
 */
import { BaseItem } from "../BaseItem.js";
import type { GeneralReadOnly, StatName } from "../types.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import { CounterAttemptTrigger, CounterActivateTrigger } from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";

export class CounterWhiteFanItem extends BaseItem {
  readonly code = "che_반계_백우선";
  readonly rawName = "백우선";
  readonly name = "백우선(반계)";
  readonly info =
    "[전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 30% 확률로 되돌림, 반목 성공시 대미지 추가(+60% → +100%), 소모 군량 +10%";
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

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number, aux?: unknown): number {
    if (statName === "killRice") {
      return value * 1.1;
    }
    if (statName === "warMagicSuccessDamage" && aux === "반목") {
      return value + 0.4;
    }
    return value;
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new CounterAttemptTrigger(unit, RaiseType.ITEM, 0.3),
      new CounterActivateTrigger(unit, RaiseType.ITEM)
    );
  }
}
