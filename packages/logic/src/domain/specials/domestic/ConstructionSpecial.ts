import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type DomesticAux } from "../types";

/**
 * Construction (축성) - Domestic Special Ability
 * [내정] 성벽 보수 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%
 */
export class ConstructionSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 10;
  name = "축성";
  info = "[내정] 성벽 보수 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "성벽") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
      if (varType === "success") return value + 0.1;
    }

    return value;
  }
}
