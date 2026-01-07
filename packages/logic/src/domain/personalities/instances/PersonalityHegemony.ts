import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 패권 (che_패권)
 * 훈련 +5, 징·모병 비용 +20%
 */
export class PersonalityHegemony extends BasePersonality {
  id = 3;
  name = "패권";
  info = "훈련 +5, 징·모병 비용 +20%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost") {
        return value * 1.2;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "bonusTrain") {
      return value + 5;
    }
    return value;
  }
}
