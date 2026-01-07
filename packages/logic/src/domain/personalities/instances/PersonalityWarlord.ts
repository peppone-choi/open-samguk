import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 할거 (che_할거)
 * 명성 -10%, 훈련 +5
 */
export class PersonalityWarlord extends BasePersonality {
  id = 5;
  name = "할거";
  info = "명성 -10%, 훈련 +5";

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "dedication") {
      return value * 0.9;
    }
    if (statName === "bonusTrain") {
      return value + 5;
    }
    return value;
  }
}
