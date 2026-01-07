import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type DomesticAux } from "../types";

/**
 * Benevolence (인덕) - Domestic Special Ability
 * [내정] 주민 선정·정착 장려 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%
 */
export class BenevolenceSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_LEADERSHIP];

  id = 20;
  name = "인덕";
  info = "[내정] 주민 선정·정착 장려 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "민심" || turnType === "인구") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
      if (varType === "success") return value + 0.1;
    }

    return value;
  }
}
