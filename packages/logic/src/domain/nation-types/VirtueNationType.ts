import { BaseNationType } from "./types";

/**
 * VirtueNationType (덕가) - School of Virtue
 *
 * Pros: 치안↑ 인구↑ 민심↑
 * Cons: 쌀수입↓ 수성↓
 *
 * Bonuses:
 * - Security: +10% effectiveness, -20% cost
 * - Population & Morale: +10% effectiveness, -20% cost
 *
 * Penalties:
 * - Defense & Walls: -10% effectiveness, +20% cost
 * - Rice income: -10%
 * - Population growth: +20%
 */
export class VirtueNationType extends BaseNationType {
  readonly name = "덕가";
  readonly pros = "치안↑ 인구↑ 민심↑";
  readonly cons = "쌀수입↓ 수성↓";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: unknown): number {
    // Security bonuses
    if (turnType === "치안") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }
    // Morale or Population bonuses
    else if (turnType === "민심" || turnType === "인구") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }
    // Defense & Walls penalties
    else if (turnType === "수비" || turnType === "성벽") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Rice income penalty
    if (type === "rice") {
      return amount * 0.9;
    }
    // Population growth bonus
    if (type === "pop" && amount > 0) {
      return amount * 1.2;
    }

    return amount;
  }
}
