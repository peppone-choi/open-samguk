import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import {
  SpecialWeightType,
  SpecialType,
  type StatAux,
  type WarUnit,
  type WarUnitTriggerCaller,
} from "../types";

/**
 * Critical (필살) - War Special Ability
 * [전투] 필살 확률 +30%p, 필살 발동시 대상 회피 불가, 필살 계수 향상
 */
export class CriticalSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP,
    SpecialType.STAT_STRENGTH,
    SpecialType.STAT_INTEL,
  ];

  id = 71;
  name = "필살";
  info = "[전투] 필살 확률 +30%p, 필살 발동시 대상 회피 불가, 필살 계수 향상";

  onCalcStat(_general: General, statName: string, value: any, aux?: StatAux): any {
    if (statName === "warCriticalRatio") {
      return value + 0.3;
    }
    if (statName === "criticalDamageRange") {
      const [rangeMin, rangeMax] = value as [number, number];
      return [(rangeMin + rangeMax) / 2, rangeMax];
    }

    return value;
  }

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    // TODO: Implement che_필살강화_회피불가 trigger
    // return new WarUnitTriggerCaller(
    //   new CriticalEnhancedNoEvasionTrigger(unit)
    // );
    return null;
  }
}
