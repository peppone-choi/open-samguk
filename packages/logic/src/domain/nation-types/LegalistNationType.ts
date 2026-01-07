import { BaseNationType } from "./types";

/**
 * LegalistNationType (법가) - Legalist School
 *
 * Pros: 금수입↑ 치안↑
 * Cons: 인구↓ 민심↓
 *
 * Bonuses:
 * - Security: +10% effectiveness, -20% cost
 * - Gold income: +10%
 *
 * Penalties:
 * - Morale & Population: -10% effectiveness, +20% cost
 * - Population growth: -20%
 */
export class LegalistNationType extends BaseNationType {
  readonly name = "법가";
  readonly pros = "금수입↑ 치안↑";
  readonly cons = "인구↓ 민심↓";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: unknown): number {
    // Security bonuses
    if (turnType === "치안") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }
    // Morale or Population penalties
    else if (turnType === "민심" || turnType === "인구") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Gold income bonus
    if (type === "gold") {
      return amount * 1.1;
    }
    // Population growth penalty
    if (type === "pop" && amount > 0) {
      return amount * 0.8;
    }

    return amount;
  }
}
