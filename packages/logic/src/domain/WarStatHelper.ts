import { getItemRegistry } from "./items/ItemRegistry.js";
import type { WarUnit } from "./specials/types.js";
import { WarUnitGeneral } from "./WarUnitGeneral.js";
import type { StatName } from "./items/types.js";

/**
 * 전투 통계 보정 헬퍼
 * 전투 중 아이템, 특기 등에 의해 동적으로 변하는 장수의 스탯(공격력, 방어력 등)을 계산합니다.
 */
export class WarStatHelper {
  /**
   * 아이템의 스탯 계산 로직(onCalcStat)과 상대방 아이템의 디버프 로직(onCalcOpposeStat)을 종합하여 최종 스탯을 산출합니다.
   *
   * @param unit 스탯을 계산할 대상 유닛
   * @param statName 계산할 스탯의 종류 (예: attack, defense, initWarPhase 등)
   * @param baseValue 기초 스탯 값
   * @param aux 추가 계산에 필요한 보조 데이터
   * @returns 보정치가 적용된 최종 스탯 값
   */
  static calcStat(unit: WarUnit, statName: StatName, baseValue: number, aux?: any): number {
    let value = baseValue;
    const reg = getItemRegistry();

    // 1. 본인이 장착한 아이템의 효과 적용 (onCalcStat)
    if (unit instanceof WarUnitGeneral) {
      const g = unit.general;
      const itemCodes = [g.weapon, g.horse, g.book, g.item];
      for (const code of itemCodes) {
        if (!code) continue;
        const item = reg.create(code);
        if (item) value = item.onCalcStat(g, statName, value, aux);
      }
    }

    // 2. 상대방이 장착한 아이템에 의한 디버프 또는 보정 효과 적용 (onCalcOpposeStat)
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
