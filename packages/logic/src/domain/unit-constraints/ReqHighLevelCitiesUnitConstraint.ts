import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/** 도시 레벨 이름 */
const CITY_LEVEL_NAMES: Record<number, string> = {
  1: "소",
  2: "중",
  3: "대",
  4: "거",
};

/**
 * 특정 레벨 이상 도시 N개 소유 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqHighLevelCities.php
 */
export class ReqHighLevelCitiesUnitConstraint implements GameUnitConstraint {
  constructor(
    private readonly reqCityLevel: number,
    private readonly reqCityCount: number
  ) {}

  test(ctx: GameUnitConstraintContext): boolean {
    let count = 0;
    for (const city of ctx.ownCities.values()) {
      if (city.level >= this.reqCityLevel) {
        count++;
      }
    }
    return count >= this.reqCityCount;
  }

  getInfo(): string {
    const levelText = CITY_LEVEL_NAMES[this.reqCityLevel] ?? `레벨${this.reqCityLevel}`;
    return `${levelText}성 ${this.reqCityCount}개 이상 소유시 가능`;
  }
}
