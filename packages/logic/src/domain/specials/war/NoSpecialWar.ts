import { BaseSpecial } from '../BaseSpecial';
import { SpecialWeightType, SpecialType } from '../types';

/**
 * No war special ability (default)
 */
export class NoSpecialWar extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 0;
  static readonly type = [SpecialType.DISABLED];

  id = 0;
  name = '-';
  info = '';
}
