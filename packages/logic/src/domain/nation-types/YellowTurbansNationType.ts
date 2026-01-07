import { BaseNationType } from "./types";

/**
 * YellowTurbansNationType (태평도) - Way of Supreme Peace (Yellow Turbans)
 *
 * Pros: 인구↑ 민심↑
 * Cons: 기술↓ 수성↓
 *
 * Bonuses:
 * - Morale & Population: +10% effectiveness, -20% cost
 * - Population growth: +20%
 *
 * Penalties:
 * - Technology: -10% effectiveness, +20% cost
 * - Defense & Walls: -10% effectiveness, +20% cost
 */
export class YellowTurbansNationType extends BaseNationType {
  readonly name = "태평도";
  readonly pros = "인구↑ 민심↑";
  readonly cons = "기술↓ 수성↓";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: unknown): number {
    // Morale or Population bonuses
    if (turnType === "민심" || turnType === "인구") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }
    // Technology penalties
    else if (turnType === "기술") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
    }
    // Defense & Walls penalties
    else if (turnType === "수비" || turnType === "성벽") {
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
