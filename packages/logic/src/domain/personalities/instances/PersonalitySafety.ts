import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 안전 (che_안전)
 * 사기 -5, 징·모병 비용 -20%
 */
export class PersonalitySafety extends BasePersonality {
  id = 9;
  name = "안전";
  info = "사기 -5, 징·모병 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost") {
        return value * 0.8;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "bonusAtmos") {
      return value - 5;
    }
    return value;
  }
}
