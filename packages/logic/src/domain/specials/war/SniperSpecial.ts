import { BaseSpecial } from "../BaseSpecial";
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  type WarUnitTriggerCaller,
} from "../types";

/**
 * Sniper (저격) - War Special Ability
 * [전투] 새로운 상대와 전투 시 50% 확률로 저격 발동, 성공 시 사기+20
 */
export class SniperSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [
    SpecialType.STAT_LEADERSHIP,
    SpecialType.STAT_STRENGTH,
    SpecialType.STAT_INTEL,
  ];

  id = 70;
  name = "저격";
  info = "[전투] 새로운 상대와 전투 시 50% 확률로 저격 발동, 성공 시 사기+20";

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    // TODO: Implement che_저격시도 and che_저격발동 triggers with params
    // return new WarUnitTriggerCaller(
    //   new SniperAttemptTrigger(unit, SniperAttemptTrigger.TYPE_NONE, 0.5, 20, 40),
    //   new SniperActivateTrigger(unit)
    // );
    return null;
  }
}
