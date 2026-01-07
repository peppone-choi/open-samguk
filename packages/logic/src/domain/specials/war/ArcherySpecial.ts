import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type DomesticAux, type StatAux } from "../types";

const T_ARCHER = 1;

export class ArcherySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP |
      SpecialType.REQ_DEXTERITY |
      SpecialType.ARMY_ARCHER |
      SpecialType.STAT_NOT_INTEL,
    SpecialType.STAT_STRENGTH | SpecialType.REQ_DEXTERITY | SpecialType.ARMY_ARCHER,
  ];

  id = 51;
  name = "궁병";
  info =
    "[군사] 궁병 계통 징·모병비 -10%<br>[전투] 회피 확률 +20%p,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 궁병 숙련을 가산";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost" && aux?.armType === T_ARCHER) {
        return value * 0.9;
      }
    }
    return value;
  }

  onCalcStat(general: General, statName: string, value: unknown, aux?: StatAux): unknown {
    if (statName === "warAvoidRatio") {
      return (value as number) + 0.2;
    }

    if (statName.startsWith("dex")) {
      const myArmType = `dex${T_ARCHER}`;
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
