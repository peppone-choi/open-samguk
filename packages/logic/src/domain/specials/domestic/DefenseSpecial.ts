import { BaseSpecial } from "../BaseSpecial";
import { SpecialWeightType, SpecialType, type DomesticAux } from "../types";

/**
 * Defense (수비) - Domestic Special Ability
 * [내정] 수비 강화 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%
 */
export class DefenseSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 11;
  name = "수비";
  info = "[내정] 수비 강화 : 기본 보정 +10%, 성공률 +10%p, 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "수비") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
      if (varType === "success") return value + 0.1;
    }

    return value;
  }
}
