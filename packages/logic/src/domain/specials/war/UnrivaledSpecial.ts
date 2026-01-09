import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import { SpecialWeightType, SpecialType, type StatAux, type WarUnit } from "../types";

/**
 * Unrivaled (무쌍) - War Special Ability
 * [전투] 대미지 +5%, 피해 -2%, 공격 시 필살 확률 +10%p,
 * 승리 수의 로그 비례로 대미지 상승(10회 ⇒ +5%, 40회 ⇒ +15%)
 * 승리 수의 로그 비례로 피해 감소(10회 ⇒ -2%, 40회 ⇒ -6%)
 */
export class UnrivaledSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 61;
  name = "무쌍";
  info =
    "[전투] 대미지 +5%, 피해 -2%, 공격 시 필살 확률 +10%p, <br>승리 수의 로그 비례로 대미지 상승(10회 ⇒ +5%, 40회 ⇒ +15%)<br>승리 수의 로그 비례로 피해 감소(10회 ⇒ -2%, 40회 ⇒ -6%)";

  onCalcStat(_general: General, statName: string, value: any, aux?: StatAux): any {
    if (statName === "warCriticalRatio" && aux?.isAttacker) {
      return value + 0.1;
    }
    return value;
  }

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    let attackMultiplier = 1.05;
    let defenceMultiplier = 0.98;

    const killnum = unit.getGeneral().killnum || 0;

    attackMultiplier += Math.log(Math.max(1, killnum / 5)) / Math.log(2) / 20;
    defenceMultiplier -= Math.log(Math.max(1, killnum / 5)) / Math.log(2) / 50;

    return [attackMultiplier, defenceMultiplier];
  }
}
