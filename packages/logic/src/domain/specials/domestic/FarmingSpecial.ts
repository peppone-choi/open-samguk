import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type DomesticAux } from "../types";

/**
 * Farming (경작) - Domestic Special Ability
 * [내정] 농지 개간 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%
 */
export class FarmingSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 1;
  name = "경작";
  info = "[내정] 농지 개간 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "농업") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
      if (varType === "success") return value + 0.1;
    }

    return value;
  }
}
