import { GameUnitConstraint, GameUnitConstraintContext } from "./types.js";

/**
 * 최소 경과 년수 요구 제약 조건
 * 레거시: legacy/hwe/sammo/GameUnitConstraint/ReqMinRelYear.php
 */
export class ReqMinRelYearUnitConstraint implements GameUnitConstraint {
  constructor(private readonly reqMinRelYear: number) {}

  test(ctx: GameUnitConstraintContext): boolean {
    return ctx.relativeYear >= this.reqMinRelYear;
  }

  getInfo(): string {
    return `${this.reqMinRelYear}년 경과 후 사용 가능`;
  }
}
