import { BaseNationType } from "./types";

/**
 * DiplomatNationType (종횡가) - Diplomatist/Strategist School
 *
 * Pros: 전략↑ 수성↑
 * Cons: 금수입↓ 농상↓
 *
 * Bonuses:
 * - Defense & Walls: +10% effectiveness, -20% cost
 * - Strategic delay: -25% (3/4 multiplier)
 * - Global delay: -50% (1/2 multiplier)
 *
 * Penalties:
 * - Agriculture & Commerce: -10% effectiveness, +20% cost
 * - Gold income: -10%
 */
export class DiplomatNationType extends BaseNationType {
  readonly name = "종횡가";
  readonly pros = "전략↑ 수성↑";
  readonly cons = "금수입↓ 농상↓";

  onCalcDomestic(turnType: string, varType: string, value: number, aux?: unknown): number {
    // Defense & Walls bonuses
    if (turnType === "수비" || turnType === "성벽") {
      if (varType === "score") return value * 1.1;
      if (varType === "cost") return value * 0.8;
    }
    // Agriculture or Commerce penalties
    else if (turnType === "농업" || turnType === "상업") {
      if (varType === "score") return value * 0.9;
      if (varType === "cost") return value * 1.2;
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

  onCalcStrategic(turnType: string, varType: string, value: number): number {
    // Strategic delay bonus
    if (varType === "delay") {
      return Math.round((value * 3) / 4);
    }
    // Global delay bonus
    if (varType === "globalDelay") {
      return Math.round(value / 2);
    }
    return value;
  }
}
