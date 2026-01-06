import { BaseNationType } from "./types";

/**
 * ConfucianNationType (유가) - Confucian School
 *
 * Pros: 농상↑ 민심↑
 * Cons: 쌀수입↓
 *
 * Bonuses:
 * - Agriculture & Commerce: +10% effectiveness, -20% cost
 * - Morale & Population: +10% effectiveness, -20% cost
 *
 * Penalties:
 * - Rice income: -10%
 */
export class ConfucianNationType extends BaseNationType {
  readonly name = "유가";
  readonly pros = "농상↑ 민심↑";
  readonly cons = "쌀수입↓";

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown,
  ): number {
    // Agriculture or Commerce bonuses
    if (turnType === "농업" || turnType === "상업") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }
    // Morale or Population bonuses
    else if (turnType === "민심" || turnType === "인구") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }

    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    // Rice income penalty
    if (type === "rice") {
      return amount * 0.9;
    }

    return amount;
  }
}
