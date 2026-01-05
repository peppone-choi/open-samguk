import { BaseNationType } from './types';

/**
 * YinYangNationType (음양가) - Yin-Yang School
 *
 * Pros: 농상↑ 인구↑
 * Cons: 기술↓ 전략↓
 *
 * Bonuses:
 * - Agriculture & Commerce: +10% effectiveness, -20% cost
 * - Population growth: +20%
 *
 * Penalties:
 * - Technology: -10% effectiveness, +20% cost
 * - Strategic delay: +33% (4/3 multiplier)
 */
export class YinYangNationType extends BaseNationType {
  readonly name = '음양가';
  readonly pros = '농상↑ 인구↑';
  readonly cons = '기술↓ 전략↓';

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown
  ): number {
    // Agriculture or Commerce bonuses
    if (turnType === '농업' || turnType === '상업') {
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

  onCalcNationalIncome(type: string, amount: number): number {
    // Population growth bonus
    if (type === 'pop' && amount > 0) {
      return amount * 1.2;
    }

    return amount;
  }

  onCalcStrategic(turnType: string, varType: string, value: number): number {
    // Strategic delay penalty
    if (varType === 'delay') {
      return Math.round((value * 4) / 3);
    }
    return value;
  }
}
