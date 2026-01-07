import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 왕좌 (che_왕좌)
 * 명성 +10%, 사기 -5
 */
export class PersonalityThrone extends BasePersonality {
  id = 0;
  name = "왕좌";
  info = "명성 +10%, 사기 -5";

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "dedication") {
      return value * 1.1;
    }
    if (statName === "bonusAtmos") {
      return value - 5;
    }
    return value;
  }
}
