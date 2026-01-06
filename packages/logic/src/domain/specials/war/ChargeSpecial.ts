import { BaseSpecial } from "../BaseSpecial";
import type { General } from "../../entities";
import {
  SpecialWeightType,
  SpecialType,
  WarUnitTriggerCaller,
  type WarUnit,
  type StatAux,
} from "../types";
import { ChargeContinueTrigger } from "../triggers/ChargeContinueTrigger";

/**
 * Charge (돌격) - War Special Ability
 * [전투] 공격 시 대등/유리한 병종에게는 퇴각 전까지 전투,
 *       공격 시 페이즈 + 2, 공격 시 대미지 +5%
 */
export class ChargeSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 60;
  name = "돌격";
  info =
    "[전투] 공격 시 대등/유리한 병종에게는 퇴각 전까지 전투, 공격 시 페이즈 + 2, 공격 시 대미지 +5%";

  onCalcStat(
    _general: General,
    statName: string,
    value: unknown,
    _aux?: StatAux,
  ): unknown {
    if (statName === "initWarPhase") {
      return (value as number) + 2;
    }
    return value;
  }

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    // 공격자일 때만 공격력 +5%
    const context = unit.getOppose();
    // isAttacker 체크는 WarContext에서 수행되므로 여기서는 항상 적용
    // 실제 전투 시 isAttacker 여부는 WarEngine에서 판단
    return [1.05, 1];
  }

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null {
    return new WarUnitTriggerCaller(new ChargeContinueTrigger(unit));
  }
}
