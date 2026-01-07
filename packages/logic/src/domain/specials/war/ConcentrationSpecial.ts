import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type StatAux } from "../types";

/**
 * Concentration (집중) - War Special Ability
 * [전투] 계략 성공 시 대미지 +50%
 */
export class ConcentrationSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 43;
  name = "집중";
  info = "[전투] 계략 성공 시 대미지 +50%";

  onCalcStat(_general: General, statName: string, value: unknown, _aux?: StatAux): unknown {
    if (statName === "warMagicSuccessDamage") {
      return (value as number) * 1.5;
    }
    return value;
  }
}
