import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import {
  SpecialWeightType,
  SpecialType,
  type StatAux,
  type WarUnit,
  type DomesticAux,
} from "../types";

/**
 * Siege (공성) - War Special Ability
 * [군사] 차병 계통 징·모병비 -10%
 * [전투] 성벽 공격 시 대미지 +100%,
 * 공격시 상대 병종에/수비시 자신 병종 숙련에 차병 숙련을 가산
 */
export class SiegeSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP |
      SpecialType.REQ_DEXTERITY |
      SpecialType.ARMY_SIEGE,
  ];

  id = 53;
  name = "공성";
  info =
    "[군사] 차병 계통 징·모병비 -10%<br>[전투] 성벽 공격 시 대미지 +100%,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 차병 숙련을 가산";

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: DomesticAux,
  ): number {
    const recruitmentTypes = ["징병", "모병"];
    if (
      recruitmentTypes.indexOf(turnType) !== -1 ||
      recruitmentTypes.some((t) => t === turnType)
    ) {
      const T_SIEGE = 5; // GameUnitConst::T_SIEGE
      if (varType === "cost" && aux?.armType === T_SIEGE) {
        return value * 0.9;
      }
    }

    return value;
  }

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    const oppose = unit.getOppose();
    if (oppose && "wall" in oppose) {
      // Opposing a city
      return [2, 1];
    }
    return [1, 1];
  }

  onCalcStat(
    general: General,
    statName: string,
    value: any,
    aux?: StatAux,
  ): any {
    if (statName.substring(0, 3) === "dex") {
      const T_SIEGE = 5; // GameUnitConst::T_SIEGE
      const myArmType = "dex" + T_SIEGE;
      const opposeArmType = "dex" + aux?.opposeType?.armType;

      if (aux?.isAttacker && opposeArmType === statName) {
        return value + (general.dex[T_SIEGE] ?? 0);
      }
      if (!aux?.isAttacker && myArmType === statName) {
        return value + (general.dex[T_SIEGE] ?? 0);
      }
    }
    return value;
  }
}
