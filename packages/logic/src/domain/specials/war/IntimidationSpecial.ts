import { BaseSpecial } from "../BaseSpecial";
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  WarUnitTriggerCaller,
  RaiseType,
} from "../types";
import { IntimidationAttemptTrigger } from "../../triggers/war/IntimidationAttemptTrigger.js";
import { IntimidationActivateTrigger } from "../../triggers/war/IntimidationActivateTrigger.js";

/**
 * Intimidation (위압) - War Special Ability
 * [전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)
 */
export class IntimidationSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 63;
  name = "위압";
  info = "[전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)";

  getBattlePhaseSkillTriggerList(unit: WarUnit): WarUnitTriggerCaller | null {
    return new WarUnitTriggerCaller(
      new IntimidationAttemptTrigger(unit, RaiseType.SPECIAL),
      new IntimidationActivateTrigger(unit, RaiseType.SPECIAL)
    );
  }
}
