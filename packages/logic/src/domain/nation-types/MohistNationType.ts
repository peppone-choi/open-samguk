import { BaseNationType } from './types';

/**
 * MohistNationType (묵가) - Mohist School
 *
 * Pros: 수성↑
 * Cons: 기술↓
 *
 * Bonuses:
 * - Defense & Walls: +10% effectiveness, -20% cost
 *
 * Penalties:
 * - Technology: -10% effectiveness, +20% cost
 */
export class MohistNationType extends BaseNationType {
  readonly name = '묵가';
  readonly pros = '수성↑';
  readonly cons = '기술↓';

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown
  ): number {
    // Defense & Walls bonuses
    if (turnType === '수비' || turnType === '성벽') {
      if (varType === 'score') return value * 1.1;
      if (varType === 'cost') return value * 0.8;
    }
    // Technology penalties
    else if (turnType === '기술') {
      if (varType === 'score') return value * 0.9;
      if (varType === 'cost') return value * 1.2;
    }

    return value;
  }
}
