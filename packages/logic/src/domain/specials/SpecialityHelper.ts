import { RandUtil } from "@sammo/common";
import { SpecialType, SpecialWeightType, BaseSpecial } from "./types.js";
import { General } from "../entities.js";
import * as WarSpecials from "./war/index.js";
import * as DomesticSpecials from "./domestic/index.js";

/**
 * 특기 선택 및 정보 조회를 위한 헬퍼 클래스
 * 레거시: SpecialityHelper.php
 */
export class SpecialityHelper {
  private static domesticSpecials: Record<string, any> = DomesticSpecials;
  private static warSpecials: Record<string, any> = WarSpecials;

  private static calcCondGeneric(general: General): number {
    let myCond = 0;
    const leadership = general.leadership;
    const strength = general.strength;
    const intel = general.intel;

    // 레거시 GameConst::$chiefStatMin = 70 (가정, 보통 70 이상을 수뇌급으로 봄)
    const chiefStatMin = 70;

    if (leadership >= chiefStatMin) {
      myCond |= SpecialType.STAT_LEADERSHIP;
    }

    if (strength >= intel * 0.95 && strength >= chiefStatMin) {
      myCond |= SpecialType.STAT_STRENGTH;
    }

    if (intel >= strength * 0.95 && intel >= chiefStatMin) {
      myCond |= SpecialType.STAT_INTEL;
    }

    if (myCond !== 0) {
      if (leadership < chiefStatMin) myCond |= SpecialType.STAT_NOT_LEADERSHIP;
      if (strength < chiefStatMin) myCond |= SpecialType.STAT_NOT_STRENGTH;
      if (intel < chiefStatMin) myCond |= SpecialType.STAT_NOT_INTEL;
    } else {
      // 어느 것도 조건에 차지 않을 때 주스탯 하나 할당
      if (leadership * 0.9 > strength && leadership * 0.9 > intel) {
        myCond |= SpecialType.STAT_LEADERSHIP;
      } else if (strength >= intel) {
        myCond |= SpecialType.STAT_STRENGTH;
      } else {
        myCond |= SpecialType.STAT_INTEL;
      }
    }

    return myCond;
  }

  private static calcCondDexterity(rng: RandUtil, general: General): number {
    const dex = {
      [SpecialType.ARMY_FOOTMAN]: general.dex[1] || 0,
      [SpecialType.ARMY_ARCHER]: general.dex[2] || 0,
      [SpecialType.ARMY_CAVALRY]: general.dex[3] || 0,
      [SpecialType.ARMY_WIZARD]: general.dex[4] || 0,
      [SpecialType.ARMY_SIEGE]: general.dex[5] || 0,
    };

    const dexSum = Object.values(dex).reduce((a, b) => a + b, 0);
    if (dexSum === 0) return 0;

    // 숙련도 비례 확률 (레거시: sqrt(sum)/4 %)
    const dexBase = Math.round(Math.sqrt(dexSum) / 4);

    if (rng.nextBool(0.8)) return 0;
    if (rng.nextRangeInt(0, 99) < dexBase) return 0;

    // 가장 높은 숙련도 병종 선택
    const sortedDex = Object.entries(dex).sort((a, b) => b[1] - a[1]);
    return parseInt(sortedDex[0][0]);
  }

  public static pickSpecialDomestic(
    rng: RandUtil,
    general: General,
    prevSpecials: string[] = []
  ): string {
    const myCond = this.calcCondGeneric(general);
    const pAbs: Record<string, number> = {};
    const pRel: Record<string, number> = {};

    for (const [key, SpecialClass] of Object.entries(this.domesticSpecials)) {
      if (key === "NoSpecialDomestic") continue;

      const type = (SpecialClass as any).type as SpecialType[];
      const weightType = (SpecialClass as any).selectWeightType;
      const weight = (SpecialClass as any).selectWeight;

      if (!type || weight === undefined) continue;

      let valid = false;
      for (const cond of type) {
        if (cond === (cond & myCond)) {
          valid = true;
          break;
        }
      }

      if (!valid) continue;
      if (prevSpecials.includes(key)) continue;

      if (weightType === SpecialWeightType.PERCENT) {
        pAbs[key] = weight;
      } else {
        pRel[key] = weight;
      }
    }

    if (Object.keys(pAbs).length > 0) {
      if (Object.keys(pRel).length > 0) {
        const totalAbs = Object.values(pAbs).reduce((a, b) => a + b, 0);
        pAbs["None"] = Math.max(0, 100 - totalAbs);
      }
      const picked = rng.choiceUsingWeight(pAbs);
      if (picked && picked !== "None") return picked;
    }

    if (Object.keys(pRel).length > 0) {
      return rng.choiceUsingWeight(pRel);
    }

    // 아무것도 선택되지 않았을 때 (재귀 방지 위해 prevSpecials 비우고 다시 시도)
    if (prevSpecials.length > 0) {
      return this.pickSpecialDomestic(rng, general, []);
    }

    return "NoSpecialDomestic";
  }

  public static pickSpecialWar(
    rng: RandUtil,
    general: General,
    prevSpecials: string[] = []
  ): string {
    let myCond = this.calcCondGeneric(general);
    myCond |= this.calcCondDexterity(rng, general);
    myCond |= SpecialType.REQ_DEXTERITY;

    const reqDex: Record<string, number> = {};
    const pAbs: Record<string, number> = {};
    const pRel: Record<string, number> = {};

    for (const [key, SpecialClass] of Object.entries(this.warSpecials)) {
      if (key === "NoSpecialWar") continue;

      const type = (SpecialClass as any).type as SpecialType[];
      const weightType = (SpecialClass as any).selectWeightType;
      const weight = (SpecialClass as any).selectWeight;

      if (!type || weight === undefined) continue;

      let valid = false;
      for (const cond of type) {
        if (cond === (cond & myCond)) {
          valid = true;
          break;
        }
      }

      if (!valid) continue;
      if (prevSpecials.includes(key)) continue;

      if (type.some((c) => c & SpecialType.REQ_DEXTERITY)) {
        reqDex[key] = weight;
      } else if (weightType === SpecialWeightType.PERCENT) {
        pAbs[key] = weight;
      } else {
        pRel[key] = weight;
      }
    }

    if (Object.keys(reqDex).length > 0) {
      return rng.choiceUsingWeight(reqDex);
    }

    if (Object.keys(pAbs).length > 0) {
      if (Object.keys(pRel).length > 0) {
        const totalAbs = Object.values(pAbs).reduce((a, b) => a + b, 0);
        pAbs["None"] = Math.max(0, 100 - totalAbs);
      }
      const picked = rng.choiceUsingWeight(pAbs);
      if (picked && picked !== "None") return picked;
    }

    if (Object.keys(pRel).length > 0) {
      return rng.choiceUsingWeight(pRel);
    }

    if (prevSpecials.length > 0) {
      return this.pickSpecialWar(rng, general, []);
    }

    return "NoSpecialWar";
  }

  public static getDomesticSpecial(id: string): BaseSpecial {
    const SpecialClass = this.domesticSpecials[id];
    if (!SpecialClass) return new DomesticSpecials.NoSpecialDomestic();
    return new SpecialClass();
  }

  public static getWarSpecial(id: string): BaseSpecial {
    const SpecialClass = this.warSpecials[id];
    if (!SpecialClass) return new WarSpecials.NoSpecialWar();
    return new SpecialClass();
  }
}
