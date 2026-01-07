import { BaseNationType } from "./types";

/**
 * TaoismNationType (도가) - Taoist School
 *
 * Pros: 인구↑
 * Cons: 기술↓ 치안↓
 *
 * Bonuses:
 * - Population growth: +20%
 *
 * Penalties:
 * - Technology: -10% effectiveness, +20% cost
 * - Security: -10% effectiveness, +20% cost
 */
export class TaoismNationType extends BaseNationType {
  readonly name = "도가";
  readonly pros = "인구↑";
  readonly cons = "기술↓ 치안↓";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: unknown): number {
    // Technology penalties
    if (turnType === "기술") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }
    // Security penalties
    else if (turnType === "치안") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Population growth bonus
    if (type === "pop" && amount > 0) {
      return amount * 1.2;
    }

    return amount;
  }
}
