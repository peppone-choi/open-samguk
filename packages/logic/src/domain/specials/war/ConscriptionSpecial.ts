import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type DomesticAux, type StatAux } from "../types";

export class ConscriptionSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP,
    SpecialType.STAT_STRENGTH,
    SpecialType.STAT_INTEL,
  ];

  id = 72;
  name = "징병";
  info =
    "[군사] 징병/모병 시 훈사 70/84 제공<br>[기타] 통솔 순수 능력치 보정 +25%, 징병/모병/소집해제 시 인구 변동 없음";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "train" || varType === "atmos") {
        if (turnType === "징병") {
          return 70;
        } else {
          return 84;
        }
      }
    }

    if (turnType === "징집인구" && varType === "score") {
      return 0;
    }

    return value;
  }

  onCalcStat(general: General, statName: string, value: unknown, _aux?: StatAux): unknown {
    if (statName === "leadership") {
      const baseLeadership = (general as any).leadership ?? 0;
      return (value as number) + baseLeadership * 0.25;
    }
    return value;
  }
}
