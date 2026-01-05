import { BaseNationType } from "./types";

/**
 * BanditNationType (도적) - Bandit School
 *
 * Pros: 계략↑
 * Cons: 금수입↓ 치안↓ 민심↓
 *
 * Bonuses:
 * - Stratagem: +10% success rate
 *
 * Penalties:
 * - Security: -10% effectiveness, +20% cost
 * - Morale & Population: -10% effectiveness, +20% cost
 * - Gold income: -10%
 */
export class BanditNationType extends BaseNationType {
  readonly name = "도적";
  readonly pros = "계략↑";
  readonly cons = "금수입↓ 치안↓ 민심↓";

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown,
  ): number {
    // Security penalties
    if (turnType === "치안") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }
    // Morale or Population penalties
    else if (turnType === "민심" || turnType === "인구") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }
    // Stratagem bonus
    else if (turnType === "계략") {
      if (varType === "success") return value + 0.1;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Gold income penalty
    if (type === "gold") {
      return amount * 0.9;
    }

    return amount;
  }
}
