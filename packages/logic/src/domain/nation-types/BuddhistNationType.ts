import { BaseNationType } from './types';

/**
 * BuddhistNationType (불가) - Buddhist School
 *
 * Pros: 민심↑ 수성↑
 * Cons: 금수입↓
 *
 * Bonuses:
 * - Morale & Population: +10% effectiveness, -20% cost
 * - Defense & Walls: +10% effectiveness, -20% cost
 *
 * Penalties:
 * - Gold income: -10%
 */
export class BuddhistNationType extends BaseNationType {
  readonly name = '불가';
  readonly pros = '민심↑ 수성↑';
  readonly cons = '금수입↓';

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown
  ): number {
    // Morale or Population bonuses
    if (turnType === '민심' || turnType === '인구') {
      if (varType === 'score') return value * 1.1;
      if (varType === 'cost') return value * 0.8;
    }
    // Defense & Walls bonuses
    else if (turnType === '수비' || turnType === '성벽') {
      if (varType === 'score') return value * 1.1;
      if (varType === 'cost') return value * 0.8;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Gold income penalty
    if (type === 'gold') {
      return amount * 0.9;
    }

    return amount;
  }
}
