/**
 * NationType interface - Defines the behavior and effects of a nation's philosophical school
 *
 * This represents the various schools of thought (e.g., Confucianism, Legalism, Taoism)
 * that influence a nation's domestic, strategic, and economic capabilities.
 */
export interface NationType {
  /** Name of the nation type */
  readonly name: string;

  /** Description of pros and cons */
  readonly pros: string;
  readonly cons: string;

  /**
   * Get the info string combining pros and cons
   */
  getInfo(): string;

  /**
   * Get the name of the nation type
   */
  getName(): string;

  /**
   * Calculate domestic action modifiers
   * @param turnType - Type of domestic action (농업, 상업, 기술, 치안, 민심, 인구, 수비, 성벽, 계략)
   * @param varType - Variable type being modified (score, cost, success)
   * @param value - Original value
   * @param aux - Optional auxiliary data
   * @returns Modified value
   */
  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown,
  ): number;

  /**
   * Calculate national income modifiers
   * @param type - Income type (rice, gold, pop)
   * @param amount - Original amount
   * @returns Modified amount
   */
  onCalcNationalIncome(type: string, amount: number): number;

  /**
   * Calculate strategic action modifiers
   * @param turnType - Type of strategic action
   * @param varType - Variable type being modified (delay, globalDelay)
   * @param value - Original value
   * @returns Modified value
   */
  onCalcStrategic(turnType: string, varType: string, value: number): number;
}

/**
 * Abstract base class for NationType implementations
 */
export abstract class BaseNationType implements NationType {
  abstract readonly name: string;
  abstract readonly pros: string;
  abstract readonly cons: string;

  getInfo(): string {
    return `${this.pros} ${this.cons}`.trim();
  }

  getName(): string {
    return this.name;
  }

  onCalcDomestic(
    turnType: string,
    varType: string,
    value: number,
    aux?: unknown,
  ): number {
    return value;
  }

  onCalcNationalIncome(type: string, amount: number): number {
    return amount;
  }

  onCalcStrategic(turnType: string, varType: string, value: number): number {
    return value;
  }
}
