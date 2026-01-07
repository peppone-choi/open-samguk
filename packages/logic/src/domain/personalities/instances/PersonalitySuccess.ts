import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 출세 (che_출세)
 * 명성 +10%, 징·모병 비용 +20%
 */
export class PersonalitySuccess extends BasePersonality {
  id = 6;
  name = "출세";
  info = "명성 +10%, 징·모병 비용 +20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost") {
        return value * 1.2;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "dedication") {
      return value * 1.1;
    }
    return value;
  }
}
