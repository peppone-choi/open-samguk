import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type WarUnit, type StatAux } from "../types";

export class SolidDefenseSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 62;
  name = "견고";
  info = "[전투] 상대 필살 확률 -20%p, 상대 계략 시도시 성공 확률 -10%p, 부상 없음, 아군 피해 -10%";

  onCalcOpposeStat(_general: General, statName: string, value: unknown, _aux?: StatAux): unknown {
    const debuff: Record<string, number> = {
      warMagicSuccessProb: 0.1,
      warCriticalRatio: 0.2,
    };
    if (statName in debuff) {
      return (value as number) - debuff[statName];
    }
    return value;
  }

  getWarPowerMultiplier(_unit: WarUnit): [number, number] {
    return [1, 0.9];
  }
}
