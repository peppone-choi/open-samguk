import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type DomesticAux } from "../types";

/**
 * Invention (발명) - Domestic Special Ability
 * [내정] 기술 연구 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%
 */
export class InventionSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 3;
  name = "발명";
  info = "[내정] 기술 연구 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%";

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    _aux?: DomesticAux,
  ): number {
    if (turnType === "기술") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
      if (varType === "success") return value + 0.1;
    }

    return value;
  }
}
