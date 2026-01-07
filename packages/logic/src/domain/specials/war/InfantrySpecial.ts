import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  type DomesticAux,
  type StatAux,
} from "../types";

const T_FOOTMAN = 0;

export class InfantrySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP |
      SpecialType.REQ_DEXTERITY |
      SpecialType.ARMY_FOOTMAN |
      SpecialType.STAT_NOT_INTEL,
    SpecialType.STAT_STRENGTH | SpecialType.REQ_DEXTERITY | SpecialType.ARMY_FOOTMAN,
  ];

  id = 50;
  name = "보병";
  info =
    "[군사] 보병 계통 징·모병비 -10%<br>[전투] 공격 시 아군 피해 -10%, 수비 시 아군 피해 -20%,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 보병 숙련을 가산";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost" && aux?.armType === T_FOOTMAN) {
        return value * 0.9;
      }
    }
    return value;
  }

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    if (unit.isAttacker) {
      return [1, 0.9];
    }
    return [1, 0.8];
  }

  onCalcStat(general: General, statName: string, value: unknown, aux?: StatAux): unknown {
    if (statName.startsWith("dex")) {
      const myArmType = `dex${T_FOOTMAN}`;
      const opposeArmType = aux?.opposeType ? `dex${aux.opposeType.armType}` : null;

      if (aux?.isAttacker && opposeArmType === statName) {
        return (value as number) + ((general as any)[myArmType] ?? 0);
      }
      if (!aux?.isAttacker && myArmType === statName) {
        return (value as number) + ((general as any)[myArmType] ?? 0);
      }
    }

    return value;
  }
}
