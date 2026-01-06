import { BaseNationType } from "./types";

/**
 * LogiciansNationType (명가) - School of Names/Logicians
 *
 * Pros: 기술↑ 인구↑
 * Cons: 쌀수입↓ 수성↓
 *
 * Bonuses:
 * - Technology: +10% effectiveness, -20% cost
 * - Population growth: +20%
 *
 * Penalties:
 * - Defense & Walls: -10% effectiveness, +20% cost
 * - Rice income: -10%
 */
export class LogiciansNationType extends BaseNationType {
  readonly name = "명가";
  readonly pros = "기술↑ 인구↑";
  readonly cons = "쌀수입↓ 수성↓";

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown,
  ): number {
    // Technology bonuses
    if (turnType === "기술") {
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
