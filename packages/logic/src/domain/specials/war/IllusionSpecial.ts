import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType } from "../types";

/**
 * Illusion (환술) - War Special Ability
 * [전투] 계략 성공 확률 +10%p, 계략 성공 시 대미지 +30%
 */
export class IllusionSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.PERCENT;
  static readonly selectWeight = 5;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 42;
  name = "환술";
  info = "[전투] 계략 성공 확률 +10%p, 계략 성공 시 대미지 +30%";

  onCalcStat(_general: General, statName: string, value: any): any {
    if (statName === "warMagicSuccessProb") {
      return value + 0.1;
    }
    if (statName === "warMagicSuccessDamage") {
      return value * 1.3;
    }
    return value;
  }
}
