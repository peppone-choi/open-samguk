import { BaseSpecial } from '../BaseSpecial';
import { SpecialWeightType, SpecialType } from '../types';

/**
 * No domestic special ability (default)
 */
export class NoSpecialDomestic extends BaseSpecial {
  static readonly selectWeightType = SpecialWeightType.NORM;
  static readonly selectWeight = 0;
  static readonly type = [SpecialType.DISABLED];

  id = 0;
  name = '-';
  info = '';
}
