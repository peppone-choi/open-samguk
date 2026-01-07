import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 대의 (che_대의)
 * 명성 +10%, 훈련 -5
 */
export class PersonalityEminence extends BasePersonality {
  id = 1;
  name = "대의";
  info = "명성 +10%, 훈련 -5";

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "dedication") {
      return value * 1.1;
    }
    if (statName === "bonusTrain") {
      return value - 5;
    }
    return value;
  }
}
