import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 정복 (che_정복)
 * 명성 -10%, 사기 +5
 */
export class PersonalityConquest extends BasePersonality {
  id = 4;
  name = "정복";
  info = "명성 -10%, 사기 +5";

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "dedication") {
      return value * 0.9;
    }
    if (statName === "bonusAtmos") {
      return value + 5;
    }
    return value;
  }
}
