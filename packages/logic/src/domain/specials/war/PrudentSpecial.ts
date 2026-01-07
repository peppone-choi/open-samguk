import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type StatAux } from "../types";

export class PrudentSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 44;
  name = "신중";
  info = "[전투] 계략 성공 확률 100%";

  onCalcStat(_general: General, statName: string, value: unknown, _aux?: StatAux): unknown {
    if (statName === "warMagicSuccessProb") {
      return (value as number) + 1;
    }
    return value;
  }
}
