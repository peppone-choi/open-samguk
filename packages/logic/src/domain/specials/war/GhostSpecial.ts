import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type DomesticAux, type StatAux } from "../types";

const T_WIZARD = 3;

export class GhostSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_INTEL |
      SpecialType.ARMY_WIZARD |
      SpecialType.REQ_DEXTERITY |
      SpecialType.STAT_NOT_STRENGTH,
  ];

  id = 40;
  name = "귀병";
  info =
    "[군사] 귀병 계통 징·모병비 -10%<br>[전투] 계략 성공 확률 +20%p,<br>공격시 상대 병종에/수비시 자신 병종 숙련에 귀병 숙련을 가산";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: DomesticAux): number {
    if (["징병", "모병"].includes(turnType)) {
      if (varType === "cost" && aux?.armType === T_WIZARD) {
        return value * 0.9;
      }
    }
    return value;
  }

  onCalcStat(general: General, statName: string, value: unknown, aux?: StatAux): unknown {
    if (statName === "warMagicSuccessProb") {
      return (value as number) + 0.2;
    }

    if (statName.startsWith("dex")) {
      const myArmType = `dex${T_WIZARD}`;
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
