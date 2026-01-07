import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/** 도시 레벨 이름 */
const CITY_LEVEL_NAMES: Record<number, string> = {
  1: "소",
  2: "중",
  3: "대",
  4: "거",
};

/**
 * 특정 도시를 특정 레벨 이상으로 소유 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqCitiesWithCityLevel.php
 */
export class ReqCitiesWithCityLevelUnitConstraint implements GameUnitConstraint {
  private readonly reqCities: Map<number, string>;

  /**
   * @param reqCityLevel 요구 도시 레벨
   * @param cities 도시 ID와 이름의 배열 [{ id: number, name: string }, ...]
   */
  constructor(
    private readonly reqCityLevel: number,
    cities: Array<{ id: number; name: string }>
  ) {
    this.reqCities = new Map(cities.map((c) => [c.id, c.name]));
  }

  test(ctx: GameUnitConstraintContext): boolean {
    if (this.reqCities.size === 0) {
      return false;
    }

    for (const [cityId, _cityName] of this.reqCities) {
      const city = ctx.ownCities.get(cityId);
      if (city && city.level >= this.reqCityLevel) {
        return true;
      }
    }
    return false;
  }

  getInfo(): string {
    const levelText = CITY_LEVEL_NAMES[this.reqCityLevel] ?? `레벨${this.reqCityLevel}`;
    const cityNames = Array.from(this.reqCities.values()).join(", ");
    return `${cityNames} ${levelText}성 소유시 가능`;
  }
}
