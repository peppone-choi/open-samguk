import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 재간 (che_재간)
 * 명성 -10%, 징·모병 비용 -20%
 */
export class PersonalityTalent extends BasePersonality {
  id = 7;
  name = "재간";
  info = "명성 -10%, 징·모병 비용 -20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost") {
        return value * 0.8;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "dedication") {
      return value * 0.9;
    }
    return value;
  }
}
