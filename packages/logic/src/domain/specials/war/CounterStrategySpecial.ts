import { BaseSpecial } from '../BaseSpecial';
import type { General } from '../../entities';
import {
  SpecialWeightType,
  SpecialType,
  type StatAux,
  type WarUnit,
  type WarUnitTriggerCaller,
} from '../types';

/**
 * Counter Strategy (반계) - War Special Ability
 * [전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 40% 확률로 되돌림, 반목 성공시 대미지 추가(+60% → +150%)
 */
export class CounterStrategySpecial extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 1;
  static readonly type = [SpecialType.STAT_INTEL];

  id = 45;
  name = '반계';
  info =
    '[전투] 상대의 계략 성공 확률 -10%p, 상대의 계략을 40% 확률로 되돌림, 반목 성공시 대미지 추가(+60% → +150%)';

  onCalcStat(
    _general: General,
    statName: string,
    value: any,
    aux?: StatAux
  ): any {
    if (
      statName === 'warMagicSuccessDamage' &&
      typeof aux === 'object' &&
      aux !== null &&
      'type' in aux &&
      aux.type === '반목'
    ) {
      return value + 0.9;
    }
    return value;
  }

  onCalcOpposeStat(
    _general: General,
    statName: string,
    value: any,
    _aux?: StatAux
  ): any {
    const debuff: Record<string, number> = {
      warMagicSuccessProb: 0.1,
    };
    return value - (debuff[statName] ?? 0);
  }

  getBattlePhaseSkillTriggerList(_unit: WarUnit): WarUnitTriggerCaller | null {
    // TODO: Implement che_반계시도 and che_반계발동 triggers
    // return new WarUnitTriggerCaller(
    //   new CounterStrategyAttemptTrigger(unit),
    //   new CounterStrategyActivateTrigger(unit)
    // );
    return null;
  }
}
