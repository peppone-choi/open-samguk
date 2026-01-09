import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import {
  SpecialWeightType,
  SpecialType,
  type StatAux,
  type WarUnit,
  WarUnitTriggerCaller,
  RaiseType,
} from "../types";
import { CounterAttemptTrigger } from "../../triggers/war/CounterAttemptTrigger.js";
import { CounterActivateTrigger } from "../../triggers/war/CounterActivateTrigger.js";

/**
 * Counter Strategy (반계) - War Special Ability
 * [전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 40% 확률로 되돌림, 반목 성공시 대미지 추가(+60% → +150%)
 */
export class CounterStrategySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 45;
  name = "반계";
  info =
    "[전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 40% 확률로 되돌림, 반목 성공시 대미지 추가(+60% → +150%)";

  onCalcStat(_general: General, statName: string, value: any, aux?: StatAux): any {
    if (
      statName === "warMagicSuccessDamage" &&
      typeof aux === "object" &&
      aux !== null &&
      "type" in aux &&
      aux.type === "반목"
    ) {
      return value + 0.9;
    }
    return value;
  }

  onCalcOpposeStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    const debuff: Record<string, number> = {
      warMagicSuccessProb: 0.1,
    };
    return value - (debuff[statName] ?? 0);
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null {
    return new WarUnitTriggerCaller(
      new CounterAttemptTrigger(unit, RaiseType.SPECIAL, 0.4),
      new CounterActivateTrigger(unit, RaiseType.SPECIAL)
    );
  }
}
