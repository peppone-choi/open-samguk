import { BaseSpecial } from '../BaseSpecial';
import {
  SpecialWeightType,
  SpecialType,
  type WarUnit,
  type WarUnitTriggerCaller,
} from '../types';

/**
 * Fury (격노) - War Special Ability
 * [전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동,
 * 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩
 */
export class FurySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_STRENGTH];

  id = 74;
  name = '격노';
  info =
    '[전투] 상대방 필살 시 격노(필살) 발동, 회피 시도시 25% 확률로 격노 발동, 공격 시 일정 확률로 진노(1페이즈 추가), 격노마다 대미지 20% 추가 중첩';

  getWarPowerMultiplier(unit: WarUnit): [number, number] {
    const activatedCnt = unit.hasActivatedSkillOnLog('격노');
    return [1 + 0.2 * activatedCnt, 1];
  }

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    // TODO: Implement che_격노시도 and che_격노발동 triggers
    // return new WarUnitTriggerCaller(
    //   new FuryAttemptTrigger(unit),
    //   new FuryActivateTrigger(unit)
    // );
    return null;
  }
}
