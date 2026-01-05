import { BaseSpecial } from '../BaseSpecial';
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  type WarUnitTriggerCaller,
} from '../types';

/**
 * Intimidation (위압) - War Special Ability
 * [전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)
 */
export class IntimidationSpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 63;
  name = '위압';
  info = '[전투] 첫 페이즈 위압 발동(적 공격, 회피 불가, 사기 5 감소)';

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    // TODO: Implement che_위압시도 and che_위압발동 triggers
    // return new WarUnitTriggerCaller(
    //   new IntimidationAttemptTrigger(unit),
    //   new IntimidationActivateTrigger(unit)
    // );
    return null;
  }
}
