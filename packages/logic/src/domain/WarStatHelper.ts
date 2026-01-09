import { getItemRegistry } from "./items/ItemRegistry.js";
import type { WarUnit, WarUnitCity } from "./specials/types.js";
import { WarUnitGeneral } from "./WarUnitGeneral.js";
import type { StatName } from "./items/types.js";

/**
 * 전투 중 아이템 및 특기 보정 스탯 계산 헬퍼
 */
export class WarStatHelper {
  /**
   * 아이템의 onCalcStat 및 상대방의 onCalcOpposeStat을 모두 반영하여 스탯 계산
   */
  static calcStat(unit: WarUnit, statName: StatName, baseValue: number, aux?: any): number {
    let value = baseValue;
    const reg = getItemRegistry();

    // 1. 본인 아이템 효과 (onCalcStat)
    if (unit instanceof WarUnitGeneral) {
      const g = unit.general;
      const itemCodes = [g.weapon, g.horse, g.book, g.item];
      for (const code of itemCodes) {
        if (!code) continue;
        const item = reg.create(code);
        if (item) value = item.onCalcStat(g, statName, value, aux);
      }
    }

    // 2. 상대방 아이템의 디버프 효과 (onCalcOpposeStat)
    const oppose = unit.getOppose?.();
    if (oppose instanceof WarUnitGeneral) {
      const og = oppose.general;
      const oItemCodes = [og.weapon, og.horse, og.book, og.item];
      for (const code of oItemCodes) {
        if (!code) continue;
        const item = reg.create(code);
        if (item) value = item.onCalcOpposeStat(og, statName, value, aux);
      }
    }

    return value;
  }
}
