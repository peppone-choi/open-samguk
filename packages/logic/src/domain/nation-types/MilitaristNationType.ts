import { BaseNationType } from './types';

/**
 * MilitaristNationType (병가) - Military School
 *
 * Pros: 기술↑ 수성↑
 * Cons: 인구↓ 민심↓
 *
 * Bonuses:
 * - Technology: +10% effectiveness, -20% cost
 * - Defense & Walls: +10% effectiveness, -20% cost
 *
 * Penalties:
 * - Morale & Population: -10% effectiveness, +20% cost
 * - Population growth: -20%
 */
export class MilitaristNationType extends BaseNationType {
  readonly name = '병가';
  readonly pros = '기술↑ 수성↑';
  readonly cons = '인구↓ 민심↓';

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown
  ): number {
    // Technology bonuses
    if (turnType === '기술') {
      if (varType === 'score') return value * 1.1;
      if (varType === 'cost') return value * 0.8;
    }
    // Defense & Walls bonuses
    else if (turnType === '수비' || turnType === '성벽') {
      if (varType === 'score') return value * 1.1;
      if (varType === 'cost') return value * 0.8;
    }
    // Morale or Population penalties
    else if (turnType === '민심' || turnType === '인구') {
      if (varType === 'score') return value * 0.9;
      if (varType === 'cost') return value * 1.2;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Population growth penalty
    if (type === 'pop' && amount > 0) {
      return amount * 0.8;
    }

    return amount;
  }
}
