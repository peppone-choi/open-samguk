import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type DomesticAux } from "../types";

/**
 * Strategy (귀모) - Domestic Special Ability
 * [계략] 화계·탈취·파괴·선동 : 성공률 +20%p
 */
export class StrategySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.PERCENT;
  static readonly selectWeight = 2.5;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP,
    SpecialType.STAT_STRENGTH,
    SpecialType.STAT_INTEL,
  ];

  id = 31;
  name = "귀모";
  info = "[계략] 화계·탈취·파괴·선동 : 성공률 +20%p";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "계략") {
      if (varType === "success") return value + 0.2;
    }

    return value;
  }
}
