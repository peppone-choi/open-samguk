import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 의협 (che_의협)
 * 사기 +5, 징·모병 비용 +20%
 */
export class PersonalityHero extends BasePersonality {
  id = 2;
  name = "의협";
  info = "사기 +5, 징·모병 비용 +20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost") {
        return value * 1.2;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "bonusAtmos") {
      return value + 5;
    }
    return value;
  }
}
