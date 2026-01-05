import { BaseNationType } from './types';

/**
 * FivePecksNationType (오두미도) - Five Pecks of Rice Taoist Sect
 *
 * Pros: 쌀수입↑ 인구↑
 * Cons: 기술↓ 수성↓ 농상↓
 *
 * Bonuses:
 * - Rice income: +10%
 * - Population growth: +20%
 *
 * Penalties:
 * - Technology: -10% effectiveness, +20% cost
 * - Defense & Walls: -10% effectiveness, +20% cost
 * - Agriculture & Commerce: -10% effectiveness, +20% cost
 */
export class FivePecksNationType extends BaseNationType {
  readonly name = '오두미도';
  readonly pros = '쌀수입↑ 인구↑';
  readonly cons = '기술↓ 수성↓ 농상↓';

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown
  ): number {
    // Technology penalties
    if (turnType === '기술') {
      if (varType === 'score') return value * 0.9;
      if (varType === 'cost') return value * 1.2;
    }
    // Defense & Walls penalties
    else if (turnType === '수비' || turnType === '성벽') {
      if (varType === 'score') return value * 0.9;
      if (varType === 'cost') return value * 1.2;
    }
    // Agriculture or Commerce penalties
    else if (turnType === '농업' || turnType === '상업') {
      if (varType === 'score') return value * 0.9;
      if (varType === 'cost') return value * 1.2;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Rice income bonus
    if (type === 'rice') {
      return amount * 1.1;
    }
    // Population growth bonus
    if (type === 'pop' && amount > 0) {
      return amount * 1.2;
    }

    return amount;
  }
}
