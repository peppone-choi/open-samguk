import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type DomesticAux, type StatAux } from "../types";

/**
 * MasterMind (신산) - War Special Ability
 * [계략] 화계·탈취·파괴·선동 : 성공률 +10%p
 * [전투] 계략 시도 확률 +20%p, 계략 성공 확률 +20%p
 */
export class MasterMindSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 41;
  name = "신산";
  info =
    "[계략] 화계·탈취·파괴·선동 : 성공률 +10%p\n[전투] 계략 시도 확률 +20%p, 계략 성공 확률 +20%p";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "계략") {
      if (varType === "success") return value + 0.1;
    }

    return value;
  }

  onCalcStat(_general: General, statName: string, value: unknown, _aux?: StatAux): unknown {
    if (statName === "warMagicTrialProb") {
      return (value as number) + 0.2;
    }
    if (statName === "warMagicSuccessProb") {
      return (value as number) + 0.2;
    }
    return value;
  }
}
