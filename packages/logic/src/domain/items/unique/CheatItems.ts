/**
 * 치트 아이템 (CheatItems) - che_치트_HideD의_사인검.php 포팅
 */
import { BaseItem } from "../BaseItem.js";
import { WarUnitTriggerCaller, type WarUnit } from "../../specials/types.js";
import {
  BattleHealAttemptTrigger,
  BattleHealActivateTrigger,
  SniperAttemptTrigger,
  SniperActivateTrigger,
  RageAttemptTrigger,
  RageActivateTrigger,
  AnnihilationPhaseBoostTrigger,
  InjuryImmuneTrigger,
  WarActivateSkillsTrigger,
} from "../../triggers/war/index.js";
import { RaiseType } from "../../WarUnitTriggerRegistry.js";
import { CityHealTrigger } from "../../triggers/CityHealTrigger.js";
import { Trigger } from "../../Trigger.js";
import { General } from "../../entities.js";
import type { WarPowerMultiplier, WarUnitReadOnly, GeneralReadOnly, StatName } from "../types.js";

export class SainswordItem extends BaseItem {
  readonly code = "che_치트_HideD의_사인검";
  readonly rawName = "HideD의 사인검";
  readonly name = "HideD의 사인검(치트)";
  readonly info =
    "통솔 +100, 무력 +100, 지력 +100\n[전투] 부상무효, 저격불가, 치료(20%), 저격(1/2), 훈련/사기+30, 격노, 상대필살/위압불가, 전멸시+1페이즈, 계략성공100%";
  readonly type = "item" as const;
  readonly cost = 9000000;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;

  onCalcStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    const bonus: Record<string, number> = {
      leadership: 100,
      strength: 100,
      intel: 100,
      bonusTrain: 30,
      bonusAtmos: 30,
    };
    if (statName === "warMagicSuccessProb") return 1;
    return (bonus[statName] ?? 0) + value;
  }

  onCalcOpposeStat(_general: GeneralReadOnly, statName: StatName, value: number): number {
    if (statName === "warMagicSuccessProb") return value - 0.1;
    return value;
  }

  getWarPowerMultiplier(_unit: WarUnitReadOnly): WarPowerMultiplier {
    return [1, 0.95];
  }

  getPreTurnExecuteTriggerList(_general: General): Trigger | null {
    return new CityHealTrigger("의술(사인검)", 0.5, false);
  }

  getBattleInitSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new InjuryImmuneTrigger(unit, RaiseType.ITEM),
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, ["저격불가"])
    );
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller {
    return new WarUnitTriggerCaller(
      new WarActivateSkillsTrigger(unit, RaiseType.ITEM, false, [
        "필살불가",
        "위압불가",
        "격노불가",
        "저격불가",
      ]),
      new BattleHealAttemptTrigger(unit, RaiseType.ITEM, 0.2),
      new BattleHealActivateTrigger(unit, RaiseType.ITEM),
      new SniperAttemptTrigger(unit, RaiseType.ITEM, 0.5, 20),
      new SniperActivateTrigger(unit, RaiseType.ITEM),
      new RageAttemptTrigger(unit, RaiseType.ITEM),
      new RageActivateTrigger(unit, RaiseType.ITEM),
      new AnnihilationPhaseBoostTrigger(unit, RaiseType.ITEM)
    );
  }
}

/** None 아이템 */
export class NoneItem extends BaseItem {
  readonly code = "None";
  readonly rawName = "없음";
  readonly name = "없음";
  readonly info = "아이템 없음";
  readonly type = "item" as const;
  readonly cost = 0;
  readonly consumable = false;
  readonly buyable = false;
  readonly reqSecu = 0;
}
