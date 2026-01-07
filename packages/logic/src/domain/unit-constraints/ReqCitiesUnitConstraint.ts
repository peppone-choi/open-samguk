import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 특정 도시 소유 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqCities.php
 */
export class ReqCitiesUnitConstraint implements GameUnitConstraint {
  private readonly reqCities: Map<number, string>;

  /**
   * @param cities 도시 ID와 이름의 배열 [{ id: number, name: string }, ...]
   */
  constructor(cities: Array<{ id: number; name: string }>) {
    this.reqCities = new Map(cities.map((c) => [c.id, c.name]));
  }

  test(ctx: GameUnitConstraintContext): boolean {
    if (this.reqCities.size === 0) {
      return false;
    }

    for (const cityId of this.reqCities.keys()) {
      if (ctx.ownCities.has(cityId)) {
        return true;
      }
    }
    return false;
  }

  getInfo(): string {
    const cityNames = Array.from(this.reqCities.values()).join(", ");
    return `${cityNames} 소유시 가능`;
  }
}
