import { General } from "../../entities.js";
import { DomesticAux, StatAux } from "../../specials/types.js";
import { BasePersonality } from "../BasePersonality.js";

/**
 * 은둔 (che_은둔)
 * 명성 -10%, 계급 -10%, 사기 -5, 훈련 -5, 단련 성공률 +10%
 */
export class PersonalityHermit extends BasePersonality {
  id = 10;
  name = "은둔";
  info = "명성 -10%, 계급 -10%, 사기 -5, 훈련 -5, 단련 성공률 +10%";

  onCalcDomestic(turnType: string, varType: string, value: number, _aux?: DomesticAux): number {
    if (turnType === "단련") {
      if (varType === "success") {
        return value + 0.1;
      }
    }
    return value;
  }

  onCalcStat(_general: General, statName: string, value: any, _aux?: StatAux): any {
    if (statName === "bonusAtmos") {
      return value - 5;
    }
    if (statName === "bonusTrain") {
      return value - 5;
    }
    if (statName === "dedication") {
      return value * 0.9;
    }
    if (statName === "experience") {
      return value * 0.9;
    }
    return value;
  }
}
