import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 유지 (che_유지)
 * 훈련 -5, 징·모병 비용 -20%
 */
export class PersonalityMaintain extends BasePersonality {
  id = 8;
  name = "유지";
  info = "훈련 -5, 징·모병 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost") {
        return value * 0.8;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "bonusTrain") {
      return value - 5;
    }
    return value;
  }
}
